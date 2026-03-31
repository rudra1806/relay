/**
 * useKeyStore — Zustand store for E2EE key management.
 *
 * Manages the lifecycle of the user's nacl.box key pair:
 *   - Generate keys on signup
 *   - Decrypt / load keys on login
 *   - Persist across page refresh via IndexedDB + sessionStorage
 *   - Clear on logout
 *
 * The private key NEVER leaves the client unencrypted.
 */

import { create } from 'zustand';
import {
  generateRecoveryPhrase,
  deriveKeyPairFromPhrase,
  encryptPrivateKey,
  decryptPrivateKey,
  encodeBase64,
  decodeBase64,
} from '../lib/crypto';

// ──────────────────────────────────────────────
// IndexedDB helpers for session-persistent key storage
// ──────────────────────────────────────────────
const DB_NAME = 'relay_e2ee';
const STORE_NAME = 'keys';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ──────────────────────────────────────────────
// Session encryption helpers
// Uses a random AES key stored in sessionStorage
// to protect keys in IndexedDB.
// ──────────────────────────────────────────────
const SESSION_KEY_NAME = 'relay_session_key';

async function generateSessionKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  sessionStorage.setItem(SESSION_KEY_NAME, b64);
  return key;
}

async function getSessionKey() {
  const b64 = sessionStorage.getItem(SESSION_KEY_NAME);
  if (!b64) return null;
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function sessionEncrypt(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { ciphertext: new Uint8Array(ciphertext), iv };
}

async function sessionDecrypt(ciphertext, iv, key) {
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

const useKeyStore = create((set, get) => ({
  privateKey: null,   // Uint8Array | null
  publicKey: null,    // Uint8Array | null
  isKeyReady: false,
  isSettingUpKeys: false,

  /**
   * Full signup flow: generate phrase → derive keys → encrypt with password.
   * Returns { recoveryPhrase, publicKey, encryptedPrivateKey, iv, salt }
   */
  generateAndStoreKeys: async (password) => {
    set({ isSettingUpKeys: true });
    try {
      const recoveryPhrase = generateRecoveryPhrase();
      const keyPair = deriveKeyPairFromPhrase(recoveryPhrase);
      const wrapped = await encryptPrivateKey(keyPair.secretKey, password);

      set({
        privateKey: keyPair.secretKey,
        publicKey: keyPair.publicKey,
        isKeyReady: true,
        isSettingUpKeys: false,
      });

      // Cache to session for refresh survival
      await get().cacheKeysToSession();

      return {
        recoveryPhrase,
        publicKey: encodeBase64(keyPair.publicKey),
        encryptedPrivateKey: wrapped.encrypted,
        keyIv: wrapped.iv,
        keySalt: wrapped.salt,
      };
    } catch (error) {
      set({ isSettingUpKeys: false });
      throw error;
    }
  },

  /**
   * Login flow: decrypt the server-stored encrypted private key using password.
   */
  initializeKeys: async (password, encryptedData) => {
    set({ isSettingUpKeys: true });
    try {
      const { encryptedPrivateKey, keyIv, keySalt, publicKey: publicKeyB64 } = encryptedData;

      if (!encryptedPrivateKey || !keyIv || !keySalt || !publicKeyB64) {
        throw new Error('Missing key data from server');
      }

      const secretKey = await decryptPrivateKey(encryptedPrivateKey, keyIv, keySalt, password);
      const publicKey = decodeBase64(publicKeyB64);

      set({
        privateKey: secretKey,
        publicKey,
        isKeyReady: true,
        isSettingUpKeys: false,
      });

      // Cache to session for refresh survival
      await get().cacheKeysToSession();

      return true;
    } catch (error) {
      set({ isSettingUpKeys: false });
      throw error;
    }
  },

  /**
   * Recovery flow: re-derive keys from phrase, re-encrypt with new password.
   */
  recoverKeys: async (phrase, newPassword) => {
    set({ isSettingUpKeys: true });
    try {
      const keyPair = deriveKeyPairFromPhrase(phrase);
      const wrapped = await encryptPrivateKey(keyPair.secretKey, newPassword);

      set({
        privateKey: keyPair.secretKey,
        publicKey: keyPair.publicKey,
        isKeyReady: true,
        isSettingUpKeys: false,
      });

      await get().cacheKeysToSession();

      return {
        publicKey: encodeBase64(keyPair.publicKey),
        encryptedPrivateKey: wrapped.encrypted,
        keyIv: wrapped.iv,
        keySalt: wrapped.salt,
      };
    } catch (error) {
      set({ isSettingUpKeys: false });
      throw error;
    }
  },

  /**
   * Cache keys to IndexedDB encrypted with a session-scoped AES key.
   * Survives page refresh but not tab close.
   */
  cacheKeysToSession: async () => {
    const { privateKey, publicKey } = get();
    if (!privateKey || !publicKey) return;

    try {
      const sessionKey = await generateSessionKey();
      const data = {
        privateKey: encodeBase64(privateKey),
        publicKey: encodeBase64(publicKey),
      };
      const encrypted = await sessionEncrypt(data, sessionKey);
      await idbSet('session_keys', {
        ciphertext: Array.from(encrypted.ciphertext),
        iv: Array.from(encrypted.iv),
      });
    } catch (error) {
      console.warn('Failed to cache keys to session:', error);
    }
  },

  /**
   * Attempt to restore keys from IndexedDB + sessionStorage.
   * Called on page refresh after auth check succeeds.
   * @returns {boolean} true if keys were restored
   */
  loadKeysFromSession: async () => {
    try {
      const sessionKey = await getSessionKey();
      if (!sessionKey) return false;

      const stored = await idbGet('session_keys');
      if (!stored) return false;

      const data = await sessionDecrypt(
        new Uint8Array(stored.ciphertext),
        new Uint8Array(stored.iv),
        sessionKey,
      );

      set({
        privateKey: decodeBase64(data.privateKey),
        publicKey: decodeBase64(data.publicKey),
        isKeyReady: true,
      });

      return true;
    } catch {
      // Session key mismatch or data corrupted — user will need to re-enter password
      return false;
    }
  },

  /**
   * Clear all key material. Called on logout.
   */
  clearKeys: async () => {
    set({
      privateKey: null,
      publicKey: null,
      isKeyReady: false,
      isSettingUpKeys: false,
    });

    try {
      sessionStorage.removeItem(SESSION_KEY_NAME);
      await idbClear();
    } catch {
      // Best effort cleanup
    }
  },

  /**
   * Safe accessor for the private key.
   * @returns {Uint8Array | null}
   */
  getPrivateKey: () => get().privateKey,
  getPublicKey: () => get().publicKey,
}));

export default useKeyStore;
