# 🔐 End-to-End Encryption (E2EE) Security Documentation

## Overview

Relay implements **true zero-knowledge end-to-end encryption** using industry-standard cryptographic primitives. This document explains how your messages are protected and what security guarantees you can expect.

## 🛡️ Security Guarantees

### What We Protect

✅ **Message Content**: All text messages are encrypted on your device before transmission  
✅ **Private Keys**: Your private encryption key is password-protected and never leaves your device unencrypted  
✅ **Forward Secrecy**: Each message uses a unique nonce, preventing replay attacks  
✅ **Authentication**: Messages are authenticated to prevent tampering (Poly1305 MAC)  
✅ **Key Recovery**: 12-word recovery phrase allows key restoration across devices  

### What We Don't Protect (By Design)

❌ **Metadata**: Who you message, when, and message count (required for routing)  
❌ **Images**: Currently uploaded unencrypted to Cloudinary (known limitation)  
❌ **Online Status**: Real-time presence information (required for UX)  
❌ **Contact List**: Your contacts are stored on the server (required for functionality)  

## 🔬 Cryptographic Primitives

### Message Encryption: NaCl box

**Algorithm**: X25519 (ECDH) + XSalsa20-Poly1305 (AEAD)

```
┌─────────────────────────────────────────────────────────┐
│                    NaCl box Encryption                  │
├─────────────────────────────────────────────────────────┤
│  1. Key Exchange:    X25519(senderSK, receiverPK)       │
│  2. Shared Secret:   32-byte Curve25519 point           │
│  3. Key Derivation:  HSalsa20(shared_secret, nonce)     │
│  4. Encryption:      XSalsa20(plaintext, key, nonce)    │
│  5. Authentication:  Poly1305(ciphertext, key)          │
│  6. Output:          ciphertext || mac (48 bytes)       │
└─────────────────────────────────────────────────────────┘
```

**Security Properties**:
- **Confidentiality**: XSalsa20 stream cipher (256-bit security)
- **Authenticity**: Poly1305 MAC (128-bit security)
- **Forward Secrecy**: Unique 24-byte nonce per message
- **Resistance**: Immune to timing attacks, chosen-ciphertext attacks

**Why NaCl?**
- Designed by Daniel J. Bernstein (renowned cryptographer)
- Used by Signal, WhatsApp, and other secure messengers
- Constant-time implementation (no timing side-channels)
- Misuse-resistant API (hard to use incorrectly)

### Key Wrapping: AES-256-GCM

**Algorithm**: PBKDF2-SHA256 + AES-256-GCM

```
┌─────────────────────────────────────────────────────────┐
│              Password-Based Key Wrapping                │
├─────────────────────────────────────────────────────────┤
│  1. Salt Generation:  16-byte random salt               │
│  2. Key Derivation:   PBKDF2-SHA256(password, salt,     │
│                       100,000 iterations)               │
│  3. IV Generation:    12-byte random IV                 │
│  4. Encryption:       AES-256-GCM(privateKey, key, IV)  │
│  5. Output:           ciphertext || auth_tag            │
└─────────────────────────────────────────────────────────┘
```

**Security Properties**:
- **Brute-Force Resistance**: 100,000 PBKDF2 iterations (~100ms on modern CPU)
- **Authenticity**: GCM mode provides built-in authentication
- **Unique Keys**: Random salt ensures different keys for same password
- **Resistance**: Immune to padding oracle attacks (no padding in GCM)

**Why AES-GCM?**
- NIST-approved standard (FIPS 197)
- Hardware acceleration on modern CPUs (AES-NI)
- Authenticated encryption (no need for separate MAC)
- Native browser support (Web Crypto API)

### Key Derivation: BIP39

**Algorithm**: BIP39 Mnemonic → PBKDF2-SHA512 → 512-bit seed

```
┌─────────────────────────────────────────────────────────┐
│              BIP39 Key Derivation                        │
├─────────────────────────────────────────────────────────┤
│  1. Entropy:          128 bits (12 words)               │
│  2. Checksum:         4 bits (embedded in last word)    │
│  3. Mnemonic:         12 words from BIP39 wordlist      │
│  4. Seed Derivation:  PBKDF2-SHA512(mnemonic, "mnemonic"│
│                       2048 iterations)                  │
│  5. Secret Key:       First 32 bytes of 512-bit seed    │
│  6. Key Pair:         X25519 key pair from secret key   │
└─────────────────────────────────────────────────────────┘
```

**Security Properties**:
- **Deterministic**: Same phrase always generates same keys
- **Human-Readable**: Easy to write down and backup
- **Checksum**: Last word contains checksum (detects typos)
- **Standardized**: BIP39 is used by billions in cryptocurrency wallets

**Why BIP39?**
- Proven security model (used since 2013)
- 2048-word dictionary (11 bits per word)
- 128 bits of entropy = 2^128 possible phrases (unbreakable)
- Easy to backup offline (paper, metal plates)

## 🔄 Key Lifecycle

### 1. Account Creation (Signup)

```javascript
// Client-side only
const phrase = generateRecoveryPhrase(); // 12 words
const { publicKey, secretKey } = deriveKeyPairFromPhrase(phrase);
const { encrypted, iv, salt } = await encryptPrivateKey(secretKey, password);

// Send to server (server never sees secretKey or phrase)
POST /api/auth/verify-email {
  publicKey: base64(publicKey),
  encryptedPrivateKey: base64(encrypted),
  keyIv: base64(iv),
  keySalt: base64(salt)
}
```

**Server stores**:
- `publicKey`: 32-byte public key (base64)
- `encryptedPrivateKey`: AES-GCM ciphertext (base64)
- `keyIv`: 12-byte IV (base64)
- `keySalt`: 16-byte salt (base64)

**Server NEVER sees**:
- `secretKey`: 32-byte private key
- `phrase`: 12-word recovery phrase
- `password`: User's login password

### 2. Login

```javascript
// Server returns encrypted key bundle
GET /api/auth/login → {
  publicKey,
  encryptedPrivateKey,
  keyIv,
  keySalt
}

// Client decrypts with password
const secretKey = await decryptPrivateKey(
  encryptedPrivateKey,
  keyIv,
  keySalt,
  password
);

// Cache in IndexedDB (session-encrypted)
await cacheKeys({ publicKey, secretKey });
```

### 3. Send Message

```javascript
// Client-side encryption
const nonce = nacl.randomBytes(24); // Unique per message
const { encrypted, nonce } = encryptMessage(
  plaintext,
  receiverPublicKey,
  senderSecretKey
);

// Send to server (server never sees plaintext)
POST /api/message/send/:id {
  text: base64(encrypted),  // Ciphertext
  nonce: base64(nonce)      // Public nonce
}
```

**Server stores**:
- `text`: Ciphertext (base64)
- `nonce`: 24-byte nonce (base64)
- `senderId`, `receiverId`: Routing metadata

**Server NEVER sees**:
- Plaintext message content
- Encryption keys

### 4. Receive Message

```javascript
// Server sends ciphertext + nonce
socket.on('newMessage', (message) => {
  const plaintext = decryptMessage(
    message.text,      // Ciphertext
    message.nonce,     // Nonce
    senderPublicKey,   // Sender's public key
    receiverSecretKey  // Your private key
  );
  
  displayMessage(plaintext);
});
```

### 5. Password Reset (with Recovery Phrase)

```javascript
// User enters 12-word phrase
const { publicKey, secretKey } = deriveKeyPairFromPhrase(phrase);

// Re-encrypt with new password
const { encrypted, iv, salt } = await encryptPrivateKey(secretKey, newPassword);

// Update server
PUT /api/encryption/keys {
  encryptedPrivateKey: base64(encrypted),
  keyIv: base64(iv),
  keySalt: base64(salt)
}
```

**Result**: All old messages remain readable (same keys)

### 6. Password Reset (without Recovery Phrase)

```javascript
// Generate new keys
const phrase = generateRecoveryPhrase();
const { publicKey, secretKey } = deriveKeyPairFromPhrase(phrase);
const { encrypted, iv, salt } = await encryptPrivateKey(secretKey, newPassword);

// Update server
PUT /api/encryption/keys {
  publicKey: base64(publicKey),
  encryptedPrivateKey: base64(encrypted),
  keyIv: base64(iv),
  keySalt: base64(salt)
}
```

**Result**: Old messages become permanently unreadable (new keys)

## 🔒 Security Best Practices

### For Users

✅ **DO**:
- Write down your 12-word recovery phrase on paper
- Store the phrase in a secure location (safe, safety deposit box)
- Use a strong, unique password for your account
- Log out on shared devices
- Verify you're on the correct domain before logging in

❌ **DON'T**:
- Share your recovery phrase with anyone (not even support)
- Store the phrase digitally (cloud, password manager, screenshots)
- Use the same password across multiple sites
- Leave your account logged in on public computers
- Ignore the recovery phrase modal (you'll lose access if you forget password)

### For Developers

✅ **DO**:
- Always generate unique nonces per message
- Use constant-time comparison for authentication
- Clear sensitive data from memory after use
- Validate all cryptographic inputs
- Use secure random number generators

❌ **DON'T**:
- Reuse nonces (breaks encryption)
- Store private keys unencrypted
- Log sensitive cryptographic material
- Use weak passwords for key wrapping
- Implement custom cryptography (use proven libraries)

## 🚨 Known Limitations

### 1. Image Encryption

**Status**: ❌ Not Implemented

**Issue**: Images are uploaded to Cloudinary server-side, so they're stored unencrypted.

**Workaround**: Don't send sensitive images. Use text for sensitive information.

**Future Fix**: Implement client-side image encryption with direct-to-Cloudinary uploads.

### 2. Metadata Leakage

**Status**: ⚠️ By Design

**Issue**: Server knows who you message, when, and how often (required for routing).

**Mitigation**: Use Tor or VPN to hide IP address. Consider using pseudonymous accounts.

**Future Fix**: Implement metadata-resistant protocols (e.g., mixnets, onion routing).

### 3. Server Compromise

**Status**: ✅ Mitigated

**Issue**: If server is compromised, attacker can:
- See who messages whom (metadata)
- See encrypted message ciphertext (but can't decrypt)
- See public keys (but can't derive private keys)

**Protection**: Zero-knowledge architecture ensures attacker can't read message content.

**Future Fix**: Implement perfect forward secrecy (PFS) with ephemeral keys.

### 4. Client Compromise

**Status**: ⚠️ Inherent Risk

**Issue**: If your device is compromised (malware, keylogger), attacker can:
- Steal your password
- Steal your private key from memory
- Read your messages before encryption

**Mitigation**: Use trusted devices, keep software updated, use antivirus.

**Future Fix**: Implement hardware security modules (HSM) for key storage.

## 🔬 Cryptographic Audit

### Algorithms Used

| Component | Algorithm | Key Size | Security Level |
|-----------|-----------|----------|----------------|
| Key Exchange | X25519 (Curve25519) | 256-bit | ~128-bit |
| Encryption | XSalsa20 | 256-bit | ~256-bit |
| Authentication | Poly1305 | 128-bit | ~128-bit |
| Key Wrapping | AES-256-GCM | 256-bit | ~256-bit |
| Key Derivation | PBKDF2-SHA256 | 256-bit | ~128-bit (100k iter) |
| Recovery | BIP39 + PBKDF2-SHA512 | 512-bit | ~128-bit (2048 iter) |

### Security Margins

- **X25519**: Resistant to quantum attacks up to ~2^64 operations (Grover's algorithm)
- **XSalsa20**: No known practical attacks (designed for 256-bit security)
- **Poly1305**: No known practical attacks (128-bit security)
- **AES-256**: Resistant to quantum attacks up to ~2^128 operations (Grover's algorithm)
- **PBKDF2**: 100,000 iterations = ~100ms on modern CPU (brute-force resistant)

### Threat Model

**Protected Against**:
- ✅ Passive network eavesdropping (TLS + E2EE)
- ✅ Server compromise (zero-knowledge architecture)
- ✅ Man-in-the-middle attacks (authenticated encryption)
- ✅ Replay attacks (unique nonces)
- ✅ Timing attacks (constant-time operations)
- ✅ Brute-force attacks (strong key derivation)

**NOT Protected Against**:
- ❌ Client compromise (malware, keylogger)
- ❌ Metadata analysis (who, when, how often)
- ❌ Quantum computers (future threat, requires post-quantum crypto)
- ❌ Social engineering (phishing, impersonation)
- ❌ Physical access to unlocked device

## 📚 References

### Standards & Specifications

- [NaCl: Networking and Cryptography library](https://nacl.cr.yp.to/)
- [RFC 7748: Elliptic Curves for Security (X25519)](https://tools.ietf.org/html/rfc7748)
- [XSalsa20 Specification](https://cr.yp.to/snuffle/xsalsa-20110204.pdf)
- [Poly1305 Specification](https://cr.yp.to/mac/poly1305-20050329.pdf)
- [BIP39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [NIST SP 800-38D: AES-GCM](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [RFC 8018: PKCS #5: PBKDF2](https://tools.ietf.org/html/rfc8018)

### Libraries Used

- [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) — JavaScript port of NaCl
- [bip39](https://github.com/bitcoinjs/bip39) — BIP39 implementation
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — Browser cryptography

### Further Reading

- [The Moral Character of Cryptographic Work](https://web.cs.ucdavis.edu/~rogaway/papers/moral-fn.pdf) by Phillip Rogaway
- [A Graduate Course in Applied Cryptography](https://toc.cryptobook.us/) by Dan Boneh and Victor Shoup
- [Cryptographic Right Answers](https://latacora.micro.blog/2018/04/03/cryptographic-right-answers.html) by Latacora

---

## 🤝 Responsible Disclosure

If you discover a security vulnerability in Relay's encryption implementation, please:

1. **DO NOT** disclose publicly until we've had a chance to fix it
2. Email security details to: [security@relay-chat.app](mailto:security@relay-chat.app)
3. Include steps to reproduce and potential impact
4. Allow 90 days for us to fix before public disclosure

We appreciate responsible security researchers and will acknowledge your contribution.

---

**Last Updated**: March 31, 2026  
**Version**: 1.1.0  
**Author**: Rudra Sanandiya