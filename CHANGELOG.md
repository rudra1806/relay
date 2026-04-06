# Changelog

All notable changes to Relay Chat App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-04-06

### Fixed
- **E2EE Session Persistence**: When encryption session keys expire (e.g. browser close/restart), the app now forces a clean re-login instead of leaving users stuck with unreadable encrypted messages
- Users see a clear toast notification: "Your encryption session expired. Please sign in again."
- The normal login flow handles key decryption automatically — no duplicate logic

### Changed
- Replaced the previous password re-prompt modal approach with a simpler forced re-login strategy
- Removed `KeyUnlockModal` component and `getKeyMaterial` API endpoint in favor of leveraging the existing login flow
- Simplified `useAuthStore` by removing `needsKeyUnlock` state and `unlockKeys` action

### Security
- Removed the `GET /api/encryption/key-material` endpoint, reducing the API attack surface
- E2EE key decryption now only happens through the login flow — single, auditable code path

---

## [2.0.0] - 2026-03-31

### ⚠️ BREAKING CHANGES

**Database Schema Update**: This release introduces required encryption key fields in the user model. Existing users cannot login and must re-register.

**Migration Required**:
- Clear existing database
- All users must create new accounts
- Old user records cannot be migrated (missing encryption keys)
- No backward compatibility with v1.x.x data

**Why Breaking**:
- User model now requires: `publicKey`, `encryptedPrivateKey`, `keyIv`, `keySalt`
- Login flow requires decryption of user keys
- Message model updated with `nonce` field for encrypted messages
- Authentication flow changed to support key management

### Added
- **End-to-End Encryption**: Zero-knowledge E2EE with NaCl box (X25519 + XSalsa20-Poly1305)
- **Recovery Phrase**: BIP39 12-word mnemonic for deterministic key derivation
- **Key Management**: Password-protected key storage with AES-256-GCM and PBKDF2
- **Recovery Phrase Modal**: UI component to display and save 12-word phrase during signup
- **Key Recovery Flow**: Restore encryption keys using recovery phrase in forgot password flow
- **Encryption API**: New endpoints for key storage and retrieval (`/api/encryption/*`)
- **Crypto Library**: Client-side encryption utilities (`frontend/src/lib/crypto.js`)
- **Key Store**: Zustand store for encryption key management (`frontend/src/store/useKeyStore.js`)
- **E2EE Documentation**: Comprehensive E2EE-SECURITY.md with technical specifications
- **Message Encryption**: Support for encrypted messages with unique nonces per message
- **User Key Fields**: Required database fields for encryption keys (publicKey, encryptedPrivateKey, keyIv, keySalt)
- **Dependencies**: Added tweetnacl, tweetnacl-util, bip39, and buffer packages

### Changed
- **User Model**: Added required fields for encryption key storage
- **Message Model**: Added `nonce` field for encrypted message support
- **Auth Flow**: Updated signup to generate recovery phrase and encryption keys
- **Login Flow**: Updated to decrypt and cache user encryption keys
- **Message Flow**: Messages now encrypted client-side before transmission and decrypted on receipt

### Enhanced
- **README**: Detailed E2EE architecture, security features, and complete key lifecycle documentation
- **Meta Tags**: Enhanced index.html with E2EE-related SEO optimization and security meta tags
- **Welcome Email**: Added recovery phrase notice and zero-knowledge encryption emphasis
- **Auth Store**: Integrated encryption key generation, storage, and management
- **Chat Store**: Added message encryption/decryption logic with NaCl box
- **Message Bubbles**: Support for displaying encrypted messages with decryption
- **Forgot Password Modal**: Added key recovery flow using recovery phrase

### Security
- **Zero-Knowledge Architecture**: Server never sees plaintext messages or private keys
- **Client-Side Encryption**: All messages encrypted on device before transmission
- **Authenticated Encryption**: Poly1305 MAC prevents message tampering
- **Forward Secrecy**: Unique 24-byte nonce per message prevents replay attacks
- **Password-Protected Keys**: PBKDF2-SHA256 with 100,000 iterations for key wrapping
- **Recovery Phrase**: BIP39 standard for deterministic key backup and restoration
- **Session Key Caching**: Secure key storage in IndexedDB for seamless UX

### Documentation
- Added E2EE-SECURITY.md with complete cryptographic specifications
- Added detailed threat model and security audit
- Added security best practices for users and developers
- Added known limitations and mitigations (image encryption)
- Added references to cryptographic standards and specifications
- Updated README with comprehensive E2EE section and architecture diagrams

### Migration Guide

**For Production Deployments**:

1. **Backup existing database** (if you want to preserve data for reference)
   ```bash
   mongodump --db relay --out backup/v1.1.0/
   ```

2. **Clear database** or drop collections:
   ```bash
   # MongoDB Shell
   use relay
   db.users.drop()
   db.messages.drop()
   db.contactrequests.drop()
   ```

3. **Deploy v2.0.0**
   ```bash
   git pull origin main
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   npm run build
   npm start
   ```

4. **Notify users** to re-register with new accounts

5. **Important**: Old accounts cannot be recovered (no encryption keys exist)

**For Development**:
```bash
npm run db:reset
```

**Note**: There is no automated migration path from v1.x.x to v2.0.0 because encryption keys cannot be retroactively generated for existing users. The recovery phrase must be generated during signup and shown to the user only once.

## [1.1.0] - 2026-03-30

### Added
- WhatsApp-style sticky date header that appears while scrolling
- Redesigned message input box with modern unified container design
- Smooth fade-in animation when messages load
- ResizeObserver to maintain scroll position when images load

### Improved
- Message bubbles now use 75% of screen width (up from fixed 420px)
- Tighter message spacing for better visual grouping
- Scroll-to-bottom button with debounced visibility
- Auto-scroll behavior now handles all edge cases correctly
- Message input focus state with visual feedback

### Fixed
- Scroll-to-bottom button overlapping with message input
- Messages not appearing at bottom when switching chats
- Sticky date header blinking during scroll
- Auto-scroll not triggering when sending messages while scrolled up


## [1.0.2] - 2026-03-30

### Fixed
- Scroll-to-bottom button in chat now only appears when user stops scrolling
- Button position changed to fixed for consistent placement in bottom-right corner
- Auto-scroll behavior improved to only trigger when user is already at bottom
- Fixed button sticking to messages instead of staying in corner

## [1.0.1] - 2026-03-30

### Fixed
- Image download functionality now works properly for cross-origin images hosted on Cloudinary
- Download button now fetches images as blobs to bypass CORS restrictions
- Added proper filename extraction and fallback generation with timestamps
- Added download state to prevent duplicate simultaneous requests
- Improved user feedback with error handling for failed downloads

## [1.0.0] - 2026-03-28

### Added
- Real-time messaging with Socket.IO
- User authentication with JWT
- Email verification system
- Contact request system
- Profile management with avatar upload
- Image sharing in messages
- Forgot password functionality
- Rate limiting with Arcjet
- Dark/Light theme support
- Responsive design

### Security
- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Rate limiting on sensitive endpoints
