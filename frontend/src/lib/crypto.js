/**
 * E2EE Crypto Utilities for Relay
 *
 * Pure functions — no React dependencies.
 * Uses:
 *   - tweetnacl          → nacl.box (X25519 + XSalsa20-Poly1305)
 *   - bip39              → 12-word mnemonic generation & seed derivation
 *   - Web Crypto API     → PBKDF2 + AES-GCM for password-based key wrapping
 *   - tweetnacl-util     → encoding helpers
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';
import * as bip39 from 'bip39';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12; // AES-GCM recommended IV length

// ──────────────────────────────────────────────
// 1. Recovery Phrase
// ──────────────────────────────────────────────

/**
 * Generate a cryptographically random 12-word BIP39 mnemonic.
 * @returns {string} Space-separated mnemonic (e.g. "apple banana cherry …")
 */
export function generateRecoveryPhrase() {
  return bip39.generateMnemonic();
}

/**
 * Validate a BIP39 mnemonic.
 * @param {string} phrase
 * @returns {boolean}
 */
export function isValidRecoveryPhrase(phrase) {
  return bip39.validateMnemonic(phrase.trim().toLowerCase());
}

// ──────────────────────────────────────────────
// 2. Key Derivation from Phrase
// ──────────────────────────────────────────────

/**
 * Derive a deterministic nacl.box key pair from a BIP39 mnemonic.
 *
 * phrase → 64-byte seed → first 32 bytes → nacl.box.keyPair.fromSecretKey
 *
 * @param {string} phrase  12-word BIP39 mnemonic
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }}
 */
export function deriveKeyPairFromPhrase(phrase) {
  const normalized = phrase.trim().toLowerCase();
  if (!bip39.validateMnemonic(normalized)) {
    throw new Error('Invalid recovery phrase');
  }

  // bip39.mnemonicToSeedSync returns a 64-byte Buffer
  const seed = bip39.mnemonicToSeedSync(normalized);
  // nacl.box secret key is 32 bytes
  const secretKey = new Uint8Array(seed.slice(0, 32));
  return nacl.box.keyPair.fromSecretKey(secretKey);
}

// ──────────────────────────────────────────────
// 3. Password-Based Key Wrapping (AES-GCM)
// ──────────────────────────────────────────────

/**
 * Derive an AES-GCM CryptoKey from a password using PBKDF2.
 * @param {string} password
 * @param {Uint8Array} salt  16-byte salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveAESKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt a nacl secret key with a user password.
 *
 * @param {Uint8Array} privateKey   32-byte nacl.box secret key
 * @param {string}     password     User's login password
 * @returns {Promise<{ encrypted: string, iv: string, salt: string }>}
 *          All values are base64-encoded for transport / storage.
 */
export async function encryptPrivateKey(privateKey, password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const aesKey = await deriveAESKeyFromPassword(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    privateKey,
  );

  return {
    encrypted: encodeBase64(new Uint8Array(ciphertext)),
    iv: encodeBase64(iv),
    salt: encodeBase64(salt),
  };
}

/**
 * Decrypt a password-wrapped nacl secret key.
 *
 * @param {string} encryptedB64  base64-encoded ciphertext
 * @param {string} ivB64         base64-encoded IV
 * @param {string} saltB64       base64-encoded salt
 * @param {string} password      User's login password
 * @returns {Promise<Uint8Array>}  32-byte nacl.box secret key
 * @throws {Error} If password is wrong or data is corrupted.
 */
export async function decryptPrivateKey(encryptedB64, ivB64, saltB64, password) {
  const encrypted = decodeBase64(encryptedB64);
  const iv = decodeBase64(ivB64);
  const salt = decodeBase64(saltB64);
  const aesKey = await deriveAESKeyFromPassword(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encrypted,
    );
    return new Uint8Array(decrypted);
  } catch {
    throw new Error('Decryption failed — wrong password or corrupted key');
  }
}

// ──────────────────────────────────────────────
// 4. Message Encryption (nacl.box)
// ──────────────────────────────────────────────

/**
 * Encrypt a plaintext string for a specific receiver.
 *
 * Uses nacl.box (X25519 Diffie-Hellman + XSalsa20-Poly1305).
 * A random 24-byte nonce is generated per message.
 *
 * @param {string}     plaintext          Message text (or image URL)
 * @param {Uint8Array} receiverPublicKey  32-byte receiver public key
 * @param {Uint8Array} senderSecretKey    32-byte sender secret key
 * @returns {{ encrypted: string, nonce: string }}  base64-encoded
 */
export function encryptMessage(plaintext, receiverPublicKey, senderSecretKey) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength); // 24 bytes
  const messageBytes = decodeUTF8(plaintext);
  const encrypted = nacl.box(messageBytes, nonce, receiverPublicKey, senderSecretKey);

  if (!encrypted) {
    throw new Error('Encryption failed');
  }

  return {
    encrypted: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt a nacl.box ciphertext.
 *
 * @param {string}     encryptedB64      base64-encoded ciphertext
 * @param {string}     nonceB64          base64-encoded 24-byte nonce
 * @param {Uint8Array} senderPublicKey   32-byte sender public key
 * @param {Uint8Array} receiverSecretKey 32-byte receiver secret key
 * @returns {string | null}  Decrypted plaintext, or null on failure
 */
export function decryptMessage(encryptedB64, nonceB64, senderPublicKey, receiverSecretKey) {
  try {
    const encrypted = decodeBase64(encryptedB64);
    const nonce = decodeBase64(nonceB64);
    const decrypted = nacl.box.open(encrypted, nonce, senderPublicKey, receiverSecretKey);

    if (!decrypted) {
      return null; // Authentication failed
    }

    return encodeUTF8(decrypted);
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// 5. Encoding Helpers (re-exported for convenience)
// ──────────────────────────────────────────────

export { encodeBase64, decodeBase64 };
