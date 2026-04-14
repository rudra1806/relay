# Relay - Real-Time Chat Application

<div align="center">

![Relay Logo](frontend/public/relay-icon.svg)

**A modern, zero-knowledge end-to-end encrypted, real-time messaging platform with voice & video calling, built with the MERN stack**

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.10.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Calling-FF6F00?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![E2EE](https://img.shields.io/badge/E2EE-NaCl%20Box-00D9FF?style=for-the-badge&logo=lock&logoColor=white)](https://nacl.cr.yp.to/)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) • [Calling](#-voice--video-calling) • [E2EE Security](#-end-to-end-encryption-e2ee) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Deployment](#-deployment)
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [End-to-End Encryption](#-end-to-end-encryption-e2ee)
- [Voice & Video Calling](#-voice--video-calling)
- [Real-Time Communication](#-real-time-communication)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Relay** is a production-ready, full-stack real-time chat application with **zero-knowledge end-to-end encryption** and **peer-to-peer voice & video calling** that enables users to communicate securely through text, image messages, and real-time calls. Built with modern web technologies, it features military-grade encryption, WebRTC calling, responsive design, robust security measures, and seamless real-time updates powered by WebSocket technology.

### 🔐 Privacy & Security First

Relay implements **true zero-knowledge architecture** — your messages are encrypted on your device before transmission, and the server never has access to your private keys or plaintext content. Even if the server is compromised, your conversations remain private.

### Key Highlights

- **🔐 Zero-Knowledge E2EE**: Client-side encryption with NaCl (X25519 + XSalsa20-Poly1305) — server never sees plaintext
- **🔑 BIP39 Recovery Phrase**: 12-word mnemonic for deterministic key derivation and account recovery
- **🛡️ Password-Protected Keys**: AES-256-GCM encryption with PBKDF2 (100,000 iterations) for private key storage
- **🔄 Key Recovery**: Restore encrypted messages across devices using recovery phrase
- **🤝 Contact Request System**: Privacy-first messaging with mutual consent required
- **✉️ Email Verification**: Secure OTP-based email verification for new signups
- **🔑 Password Reset**: Forgot password with OTP verification and encryption key recovery
- **⚡ Real-Time Messaging**: Instant encrypted message delivery using Socket.IO
- **📞 Voice & Video Calling**: Peer-to-peer WebRTC calls with camera flip and call controls
- **📸 Rich Media Support**: Send text messages and images with Cloudinary integration
- **🛡️ Advanced Security**: Multi-layered protection with Arcjet (bot detection, rate limiting, shield)
- **🚦 Smart Rate Limiting**: Balanced protection (500 req/min) with automatic retry and graceful degradation
- **👥 User Presence**: Real-time online/offline status and typing indicators
- **✓ Read Receipts**: Track message delivery and read status
- **📱 Discord-Style Sidebar**: Two-tab interface (Messages + All Contacts)
- **🌓 Dark/Light Theme**: System-aware theme switching with smooth transitions
- **📱 Responsive Design**: Mobile-first approach with smooth animations
- **🚀 Production Ready**: Optimized for deployment with comprehensive error handling

---

## ✨ Features

### Core Functionality

#### 🔐 End-to-End Encryption
- ✅ **Zero-knowledge architecture** — server never sees plaintext messages or private keys
- ✅ **Client-side encryption** with NaCl box (X25519 key exchange + XSalsa20-Poly1305 AEAD)
- ✅ **BIP39 recovery phrase** — 12-word mnemonic for deterministic key derivation
- ✅ **Password-protected key storage** — AES-256-GCM with PBKDF2 (100,000 iterations)
- ✅ **Session key caching** — IndexedDB for seamless experience without password re-entry
- ✅ **Key recovery** — restore access to encrypted messages across devices
- ✅ **Forward secrecy** — unique nonce per message prevents replay attacks

#### 👤 Authentication & Security
- ✅ User authentication (signup/login/logout) with JWT (7-day expiry)
- ✅ Email verification with secure OTP (6-digit, 10-minute expiry)
- ✅ Password reset with OTP verification and encryption key recovery
- ✅ HTTP-only secure cookies with SameSite=Strict (CSRF protection)
- ✅ bcrypt password hashing (10 rounds dev, 12 production)
- ✅ Timing-safe OTP comparison (prevents timing attacks)
- ✅ Rate limiting on OTP resend (60-second cooldown)
- ✅ Automatic cleanup of unverified users (24-hour retention)

#### 🤝 Contact Management
- ✅ Contact request system (send/accept/decline/cancel)
- ✅ Privacy enforcement (can only message contacts)
- ✅ Real-time contact request notifications
- ✅ Real-time contact acceptance updates
- ✅ Contact search and user discovery
- ✅ Remove contacts functionality
- ✅ Duplicate request prevention
- ✅ Connection status indicators (none/connected/pending/received)

#### 💬 Messaging Features
- ✅ Real-time one-on-one encrypted messaging
- ✅ Image sharing with automatic optimization (Cloudinary)
- ✅ Message history and persistence
- ✅ Unread message counters with real-time updates
- ✅ Read receipts and message status
- ✅ Message encryption/decryption on client side
- ✅ Automatic retry on rate limits

#### 📞 Voice & Video Calling
- ✅ One-on-one voice calls with full-duplex audio
- ✅ One-on-one video calls with live video streaming
- ✅ Incoming call modal with accept/decline actions
- ✅ Call controls: mute, camera toggle, flip camera, end call
- ✅ Camera flip (front ↔ back) for mobile devices
- ✅ PiP (picture-in-picture) local video preview
- ✅ Call duration timer with live indicator
- ✅ Auto-timeout for unanswered calls (30 seconds)
- ✅ Busy/unavailable/offline detection
- ✅ WebRTC DTLS-SRTP transport encryption
- ✅ Graceful disconnection recovery (5-second grace period)

#### 🎨 User Interface
- ✅ Discord-style sidebar with two tabs (Messages + All Contacts)
- ✅ User profile management with avatar upload
- ✅ Dark/Light theme switching with system preference detection
- ✅ Responsive mobile-first design
- ✅ Smooth animations with Framer Motion
- ✅ Image lightbox for full-screen preview
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling

### Real-Time Features
- 🔴 Online/offline user status
- ⌨️ Typing indicators
- 📨 Instant message delivery
- 📞 Real-time voice & video calls (WebRTC)
- 🔔 Real-time contact request notifications
- 🤝 Real-time contact acceptance updates
- 🚫 Real-time contact removal notifications
- 👥 Active users list

### Security Features

#### 🔐 Cryptographic Security
- 🔐 **Zero-knowledge E2EE** — messages encrypted client-side, server never sees plaintext
- 🔑 **NaCl box encryption** — X25519 (Curve25519 ECDH) + XSalsa20-Poly1305 (authenticated encryption)
- 🔑 **BIP39 recovery phrase** — 12-word mnemonic for deterministic key derivation (512-bit seed)
- 🛡️ **Password-protected keys** — AES-256-GCM wrapping with PBKDF2-SHA256 (100,000 iterations)
- 🔄 **Unique nonces** — 24-byte random nonce per message (prevents replay attacks)
- 🔐 **Session key caching** — IndexedDB with session-encrypted storage
- 🔑 **Key recovery** — restore encrypted messages using recovery phrase

#### 🛡️ Application Security
- 🔒 **JWT authentication** — 7-day expiry with HTTP-only cookies
- ✉️ **Email verification** — secure 6-digit OTP with 10-minute expiry
- 🔑 **Password reset** — OTP verification + encryption key recovery
- 🛡️ **Arcjet security suite** — bot detection, rate limiting, SQL injection & XSS prevention
- 🍪 **Secure cookies** — HTTP-only, Secure flag (production), SameSite=Strict
- 🔐 **bcrypt hashing** — 10 rounds (dev), 12 rounds (production)
- 🚫 **CSRF protection** — SameSite cookie policy
- ⚡ **Input validation** — comprehensive request validation and sanitization
- ⏱️ **Timing attack prevention** — constant-time OTP comparison with crypto.timingSafeEqual()
- 🚦 **Smart rate limiting** — 500 requests/minute with automatic retry and exponential backoff
- 🔄 **Fail-open strategy** — graceful degradation on service failures
- 🧹 **Automatic cleanup** — unverified users deleted after 24 hours (production only)


---

## 🏗️ Architecture

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                                   │  │
│  │  - Zustand State Management                              │  │
│  │  - React Router (SPA)                                    │  │
│  │  - Socket.IO Client                                      │  │
│  │  - Axios HTTP Client                                     │  │
│  │  - Verification Modal (OTP Input)                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  E2EE Layer (Client-Side Only)                     │  │  │
│  │  │  - NaCl Box (X25519 + XSalsa20-Poly1305)           │  │  │
│  │  │  - BIP39 Recovery Phrase Generation                │  │  │
│  │  │  - AES-256-GCM Key Wrapping (Web Crypto API)       │  │  │
│  │  │  - PBKDF2 Password-Based Key Derivation            │  │  │
│  │  │  - IndexedDB Session Cache                         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket (encrypted payloads)
┌────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Arcjet     │  │     CORS     │  │   Cookie Parser      │  │
│  │  Protection  │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            JWT Authentication Middleware                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕
┌────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Zero-Knowledge — never sees          │  │
│  │  plaintext messages or private keys)                     │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐ │  │
│  │  │ Auth Routes  │ │ Message      │ │ Contact Routes    │ │  │
│  │  │ - /signup    │ │ Routes       │ │ - /search         │ │  │
│  │  │ - /verify    │ │ - /contacts  │ │ - /request        │ │  │
│  │  │ - /login     │ │ - /chats     │ │ - /accept         │ │  │
│  │  │ - /logout    │ │ - /:id (get) │ │ - /decline        │ │  │
│  │  │ - /check     │ │ - /send/:id  │ │ - /cancel         │ │  │
│  │  │ - /update    │ │ - /read/:id  │ │ - /remove         │ │  │
│  │  │ - /forgot    │ │              │ │                   │ │  │
│  │  │ - /reset     │ │              │ │                   │ │  │
│  │  └──────────────┘ └──────────────┘ └───────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Encryption Routes (opaque blob storage only)        │ │  │
│  │  │ - GET  /public-key/:userId                          │ │  │
│  │  │ - PUT  /keys                                        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Socket.IO Server (WebSocket)                            │  │
│  │  - Connection management                                 │  │
│  │  - Real-time event handling                              │  │
│  │  - Online users tracking                                 │  │
│  │  - WebRTC call signaling (SDP/ICE relay)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cleanup Service (Background)                            │  │
│  │  - Runs every 6 hours (production only)                  │  │
│  │  - Deletes unverified users > 24 hours old               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕
┌────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   MongoDB    │  │  Cloudinary  │  │      Resend          │  │
│  │   Database   │  │  (Images)    │  │  (Email/OTP)         │  │
│  │  (encrypted  │  │              │  │                      │  │
│  │   blobs only)│  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```


### Authentication Flow Sequence Diagram

#### Signup with Email Verification

```mermaid
sequenceDiagram
    participant Client
    participant Arcjet
    participant Server
    participant MongoDB
    participant Resend

    Client->>Server: POST /api/auth/signup
    Server->>Arcjet: Validate request (bot detection, rate limit)
    Arcjet-->>Server: Request allowed
    Server->>Server: Validate input data
    Server->>MongoDB: Check if user exists
    MongoDB-->>Server: User not found
    Server->>Server: Hash password (bcrypt)
    Server->>Server: Generate 6-digit OTP
    Server->>MongoDB: Create user (isVerified: false)
    MongoDB-->>Server: User created
    Server->>Resend: Send OTP email
    Resend-->>Server: Email sent
    Server-->>Client: 201 Created (user data, no token)
    Client->>Client: Show verification modal
    
    Note over Client,Resend: User receives OTP email and enters code
    
    Client->>Server: POST /api/auth/verify-email (+ publicKey, encryptedPrivateKey, keyIv, keySalt)
    Server->>Server: Validate OTP format
    Server->>MongoDB: Find user with OTP
    MongoDB-->>Server: User found
    Server->>Server: Check OTP expiry (10 min)
    Server->>Server: Compare OTP (constant-time)
    Server->>MongoDB: Mark verified + store E2EE key material
    MongoDB-->>Server: User updated
    Server->>Server: Generate JWT token
    Server->>Server: Set HTTP-only cookie
    Server->>Resend: Send welcome email (async)
    Server-->>Client: 200 OK (user data + key material + token)
    Client->>Client: Cache keys in IndexedDB (session-encrypted)
    Client->>Client: Show 12-word recovery phrase modal
    Client->>Client: User confirms phrase saved
    Client->>Client: Navigate to chat
    Client->>Server: Connect WebSocket
```

#### Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant Arcjet
    participant Server
    participant JWT
    participant MongoDB

    Client->>Server: POST /api/auth/login
    Server->>Arcjet: Validate request (bot detection, rate limit)
    Arcjet-->>Server: Request allowed
    Server->>Server: Validate input data
    Server->>MongoDB: Find user by email
    MongoDB-->>Server: User found
    Server->>Server: Compare password (bcrypt)
    
    alt User not verified
        Server-->>Client: 403 Forbidden (requiresVerification: true)
        Client->>Client: Show verification modal
        Note over Client,Server: User can resend OTP or verify
    else User verified
        Server->>JWT: Generate token
        JWT-->>Server: JWT token
        Server->>Server: Set HTTP-only cookie
        Server-->>Client: 200 OK (user data + encrypted key bundle)
        Client->>Client: Decrypt private key with password (AES-GCM + PBKDF2)
        Client->>Client: Cache keys in IndexedDB (session-encrypted)
        Client->>Server: Connect WebSocket
    end
```

#### OTP Resend Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant MongoDB
    participant Resend

    Client->>Server: POST /api/auth/resend-otp
    Server->>Server: Validate email format
    Server->>MongoDB: Find user
    MongoDB-->>Server: User found
    
    alt Already verified
        Server-->>Client: 400 Bad Request
    else Rate limited (< 60s since last OTP)
        Server-->>Client: 429 Too Many Requests (retryAfter: X)
    else Allowed
        Server->>Server: Generate new 6-digit OTP
        Server->>MongoDB: Update user with new OTP
        MongoDB-->>Server: User updated
        Server->>Resend: Send OTP email
        Resend-->>Server: Email sent
        Server-->>Client: 200 OK (success message)
        Client->>Client: Show countdown timer (60s)
    end
```

### Message Flow Sequence Diagram (with E2EE)

```mermaid
sequenceDiagram
    participant Sender
    participant SenderSocket
    participant Server
    participant MongoDB
    participant Cloudinary
    participant ReceiverSocket
    participant Receiver

    Sender->>Sender: Encrypt text with nacl.box(text, nonce, receiverPK, senderSK)
    Sender->>Server: POST /api/message/send/:id (encrypted text + nonce + raw image)
    Server->>Server: Validate JWT & user
    alt Image included
        Server->>Cloudinary: Upload image (raw base64)
        Cloudinary-->>Server: Image URL
    end
    Server->>MongoDB: Save message (ciphertext + nonce + image URL)
    Note over Server: Server NEVER sees plaintext message content
    MongoDB-->>Server: Message saved
    Server-->>Sender: 201 Created (message with ciphertext)
    Sender->>Sender: Decrypt own message for local display
    Server->>ReceiverSocket: Emit 'newMessage' event (ciphertext)
    ReceiverSocket->>Receiver: Decrypt with nacl.box.open(ciphertext, nonce, senderPK, receiverSK)
    Receiver->>Receiver: Display decrypted message
    Receiver->>Server: PATCH /api/message/read/:id
    Server->>MongoDB: Mark messages as read
    Server->>SenderSocket: Emit 'messagesRead' event
    SenderSocket->>Sender: Update read status
```


### Real-Time Communication Flow

```mermaid
sequenceDiagram
    participant User1
    participant Socket1
    participant Server
    participant Socket2
    participant User2

    User1->>Server: Connect (with JWT cookie)
    Server->>Server: Authenticate socket
    Server->>Socket1: Connection established
    Server->>Socket1: Emit 'getOnlineUsers'
    
    User2->>Server: Connect (with JWT cookie)
    Server->>Server: Authenticate socket
    Server->>Socket2: Connection established
    Server->>Socket1: Emit 'getOnlineUsers' (updated)
    Server->>Socket2: Emit 'getOnlineUsers'
    
    User1->>Socket1: Emit 'typing' {receiverId: User2}
    Socket1->>Server: Forward typing event
    Server->>Socket2: Emit 'userTyping' {senderId: User1}
    Socket2->>User2: Show typing indicator
    
    User1->>Socket1: Emit 'stopTyping' {receiverId: User2}
    Socket1->>Server: Forward stopTyping event
    Server->>Socket2: Emit 'userStopTyping' {senderId: User1}
    Socket2->>User2: Hide typing indicator
    
    User1->>Server: Send message via HTTP
    Server->>Socket2: Emit 'newMessage'
    Socket2->>User2: Display new message
    
    User1->>Server: Disconnect
    Server->>Socket2: Emit 'getOnlineUsers' (updated)
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.4 | UI library for building component-based interfaces |
| **Vite** | 8.0.1 | Fast build tool and development server |
| **Zustand** | 5.0.12 | Lightweight state management |
| **React Router** | 7.13.2 | Client-side routing |
| **Socket.IO Client** | 4.8.3 | Real-time WebSocket communication |
| **Axios** | 1.13.6 | HTTP client for API requests |
| **Framer Motion** | 12.38.0 | Animation library |
| **Lucide React** | 1.0.1 | Icon library |
| **date-fns** | 4.1.0 | Date formatting utilities |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **TweetNaCl** | 1.0.3 | E2EE cryptographic operations (X25519 ECDH, XSalsa20-Poly1305 AEAD) |
| **TweetNaCl-util** | 0.15.1 | Encoding utilities for TweetNaCl (base64, UTF-8) |
| **bip39** | 3.1.0 | BIP39 12-word recovery phrase generation & deterministic seed derivation |
| **buffer** | 6.0.3 | Buffer polyfill for bip39 in browser environments |
| **Web Crypto API** | Native | PBKDF2-SHA256 key derivation & AES-256-GCM key wrapping |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | ≥20.0.0 | JavaScript runtime |
| **Express.js** | 4.21.2 | Web application framework |
| **MongoDB** | 8.10.1 | NoSQL database |
| **Mongoose** | 8.10.1 | MongoDB ODM |
| **Socket.IO** | 4.8.1 | Real-time bidirectional communication |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Cloudinary** | 2.5.1 | Image storage and optimization |
| **Resend** | 6.0.2 | Transactional email service |
| **Arcjet** | 1.0.0-beta.10 | Security suite (bot detection, rate limiting) |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **Cookie Parser** | 1.4.7 | Cookie parsing middleware |


---

## 💻 System Requirements

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MongoDB**: Version 5.0 or higher (or MongoDB Atlas account)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/relay.git
cd relay
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Configuration](#-configuration) section).

### 4. Start Development Servers

#### Option 1: Start Both Servers Separately

```bash
# Terminal 1 - Start backend server
cd backend
npm run dev

# Terminal 2 - Start frontend server
cd frontend
npm run dev
```

#### Option 2: Use Concurrently (if configured)

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/relay
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/relay?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Relay Team

# Client Configuration
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Arcjet Security Configuration
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Service Setup Instructions

#### MongoDB Setup
1. **Local MongoDB**: Install MongoDB locally or use Docker
2. **MongoDB Atlas** (Recommended):
   - Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get connection string and add to `MONGO_URI`

#### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to environment variables

#### Resend Setup
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Generate API key
4. Add to environment variables

#### Arcjet Setup
1. Create account at [arcjet.com](https://arcjet.com)
2. Create new site
3. Get site key
4. Add to environment variables


---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### 1. Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePic": "",
  "isVerified": false,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "message": "Signup successful. Please check your email for verification code."
}
```

**Note:** After signup, a 6-digit OTP is sent to the user's email. The user must verify their email before logging in.

#### 2. Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePic": "",
  "isVerified": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid OTP format or already verified
- `401 Unauthorized`: Invalid OTP
- `404 Not Found`: User not found

#### 3. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "A new verification code has been sent to your email",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: Email already verified
- `429 Too Many Requests`: Rate limit exceeded (60-second cooldown)

**Note:** Rate limited to one request per 60 seconds per email address.

#### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://cloudinary.com/...",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

#### 5. Logout
```http
POST /api/auth/logout
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

#### 6. Check Authentication
```http
GET /api/auth/check
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/..."
  }
}
```

#### 7. Update Profile
```http
PUT /api/auth/update-profile
Authorization: Required (JWT Cookie)
Content-Type: application/json

{
  "name": "John Updated",
  "profilePic": "data:image/jpeg;base64,..."
}
```

#### 8. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset code has been sent to your email",
  "email": "john@example.com"
}
```

**Error Responses:**
- `403 Forbidden`: Email not verified
- `429 Too Many Requests`: Rate limit exceeded (60-second cooldown)

**Note:** A 6-digit OTP is sent to the user's email. Rate limited to one request per 60 seconds per email address.

#### 9. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid OTP format or no reset code found
- `401 Unauthorized`: Invalid OTP
- `403 Forbidden`: Email not verified

**Note:** OTP expires after 10 minutes. After successful reset, user can login with the new password.


### 4. Contact Request System

**Overview:**
The contact request system implements privacy-first messaging where users must be contacts before they can message each other. This prevents unsolicited messages and gives users control over who can reach them.

**Add Contact Flow:**
```mermaid
sequenceDiagram
    participant UserA
    participant Server
    participant MongoDB
    participant Socket
    participant UserB

    UserA->>Server: POST /api/contacts/request/:userId
    Server->>MongoDB: Check if already contacts
    MongoDB-->>Server: Not contacts
    Server->>MongoDB: Check for existing request
    MongoDB-->>Server: No existing request
    Server->>MongoDB: Create contact request
    MongoDB-->>Server: Request created
    Server-->>UserA: 201 Created
    Server->>Socket: Emit 'contactRequest' to UserB
    Socket->>UserB: Show notification + badge
    
    UserB->>Server: GET /api/contacts/requests/pending
    Server->>MongoDB: Find pending requests
    MongoDB-->>Server: Requests list
    Server-->>UserB: 200 OK (requests)
    
    UserB->>Server: PATCH /api/contacts/accept/:requestId
    Server->>MongoDB: Update request status
    Server->>MongoDB: Add to both users' contacts
    MongoDB-->>Server: Updated
    Server-->>UserB: 200 OK
    Server->>Socket: Emit 'contactAccepted' to UserA
    Socket->>UserA: Update UI + refresh contacts
    UserB->>UserB: Refresh contacts list
    
    Note over UserA,UserB: Both users can now message each other
```

**Key Features:**
- ✅ Mutual consent required before messaging
- ✅ Search users by name or email
- ✅ Send/accept/decline/cancel requests
- ✅ Real-time notifications for new requests
- ✅ Real-time updates when requests are accepted
- ✅ Remove contacts anytime
- ✅ Backend enforces privacy (can't message non-contacts)
- ✅ Duplicate request prevention
- ✅ Can resend after decline

**Privacy Enforcement:**
```javascript
// Backend checks before allowing messages
const isContact = sender.contacts.some(
  (contactId) => contactId.toString() === receiverId
);

if (!isContact) {
  return res.status(403).json({ 
    message: "You can only message your contacts" 
  });
}
```

**UI Components:**
- **Add Contact Modal**: Search users and send requests
- **Contact Requests Modal**: View received and sent requests
- **Sidebar**: Two-tab interface (Messages + All Contacts)
- **Chat Header**: Remove contact option in menu

**Real-Time Updates:**
- New request → Receiver gets notification badge
- Request accepted → Sender's contacts list refreshes
- Contact removed → Both users' chats clear and contacts refresh


### Message Endpoints

#### 1. Get All Contacts
```http
GET /api/message/contacts
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
[
  {
    "_id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "profilePic": "https://cloudinary.com/..."
  }
]
```

#### 2. Get Chat Partners
```http
GET /api/message/chats
Authorization: Required (JWT Cookie)
```

Returns only users you've had conversations with.

#### 3. Get Messages with User
```http
GET /api/message/:userId
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
[
  {
    "_id": "message_id",
    "senderId": "sender_user_id",
    "receiverId": "receiver_user_id",
    "text": "Hello!",
    "image": null,
    "isRead": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### 4. Send Message
```http
POST /api/message/send/:userId
Authorization: Required (JWT Cookie)
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "image": "data:image/jpeg;base64,..." // Optional
}
```

**Response (201 Created):**
```json
{
  "_id": "message_id",
  "senderId": "sender_user_id",
  "receiverId": "receiver_user_id",
  "text": "Hello, how are you?",
  "image": "https://cloudinary.com/...",
  "isRead": false,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

#### 5. Mark Messages as Read
```http
PATCH /api/message/read/:userId
Authorization: Required (JWT Cookie)
```

Marks all messages from the specified user as read.

**Response (200 OK):**
```json
{
  "modifiedCount": 5
}
```

---

### Contact Endpoints

#### 1. Get All Contacts
```http
GET /api/contacts
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
[
  {
    "_id": "user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "profilePic": "https://cloudinary.com/..."
  }
]
```

#### 2. Search Users
```http
GET /api/contacts/search?query=john
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
[
  {
    "_id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "profilePic": "https://cloudinary.com/...",
    "connectionStatus": "none" // "none" | "connected" | "pending" | "received"
  }
]
```

**Connection Status:**
- `none`: No connection
- `connected`: Already in contacts
- `pending`: You sent them a request
- `received`: They sent you a request

#### 3. Send Contact Request
```http
POST /api/contacts/request/:userId
Authorization: Required (JWT Cookie)
```

**Response (201 Created):**
```json
{
  "_id": "request_id",
  "senderId": "your_user_id",
  "receiverId": "other_user_id",
  "status": "pending",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot send to yourself, already contacts, or request already exists
- `404 Not Found`: User not found

#### 4. Get Pending Requests (Received)
```http
GET /api/contacts/requests/pending
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
[
  {
    "_id": "request_id",
    "senderId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePic": "https://cloudinary.com/..."
    },
    "status": "pending",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### 5. Get Sent Requests
```http
GET /api/contacts/requests/sent
Authorization: Required (JWT Cookie)
```

Returns requests you've sent that are still pending.

#### 6. Accept Contact Request
```http
PATCH /api/contacts/accept/:requestId
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "message": "Contact request accepted",
  "request": { ... }
}
```

**Error Responses:**
- `403 Forbidden`: Not authorized to accept this request
- `404 Not Found`: Request not found

#### 7. Decline Contact Request
```http
PATCH /api/contacts/decline/:requestId
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "message": "Contact request declined"
}
```

#### 8. Cancel Sent Request
```http
DELETE /api/contacts/cancel/:requestId
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "message": "Contact request cancelled"
}
```

#### 9. Remove Contact
```http
DELETE /api/contacts/:userId
Authorization: Required (JWT Cookie)
```

**Response (200 OK):**
```json
{
  "message": "Contact removed"
}
```

**Note:** This removes the contact from both users' contact lists and deletes any pending requests between them.


### WebSocket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `typing` | `{ receiverId: string }` | Notify that user is typing |
| `stopTyping` | `{ receiverId: string }` | Notify that user stopped typing |
| `call:initiate` | `{ receiverId, callType }` | Start a voice or video call |
| `call:accepted` | `{ callerId, callType }` | Accept an incoming call |
| `call:rejected` | `{ callerId }` | Decline an incoming call |
| `call:offer` | `{ offer, receiverId }` | Send WebRTC SDP offer |
| `call:answer` | `{ answer, callerId }` | Send WebRTC SDP answer |
| `call:ice-candidate` | `{ candidate, peerId }` | Relay ICE candidate |
| `call:toggle-media` | `{ peerId, mediaType, enabled }` | Notify mute/camera toggle |
| `call:ended` | `{ peerId }` | End the call |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `getOnlineUsers` | `string[]` | Array of online user IDs |
| `newMessage` | `Message` | New message received |
| `userTyping` | `{ senderId: string }` | User started typing |
| `userStopTyping` | `{ senderId: string }` | User stopped typing |
| `messagesRead` | `{ readBy: string }` | Messages marked as read |
| `contactRequest` | `{ request: ContactRequest }` | New contact request received |
| `contactAccepted` | `{ userId: string, requestId: string }` | Your contact request was accepted |
| `contactRemoved` | `{ removedBy: string }` | Someone removed you as a contact |
| `call:incoming` | `{ callerId, callerName, callerPic, callType }` | Incoming call notification |
| `call:accepted` | `{ callerId }` | Call was accepted by receiver |
| `call:rejected` | `{ callerId }` | Call was rejected |
| `call:offer` | `{ offer, callerId }` | WebRTC SDP offer from caller |
| `call:answer` | `{ answer }` | WebRTC SDP answer from receiver |
| `call:ice-candidate` | `{ candidate }` | ICE candidate from peer |
| `call:toggle-media` | `{ mediaType, enabled }` | Remote peer toggled media |
| `call:ended` | `{ reason }` | Call was ended |
| `call:busy` | `{ message }` | Receiver is busy on another call |
| `call:unavailable` | `{}` | Receiver is offline |

---

## 🗄️ Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, hashed),
  profilePic: String (default: ''),
  isVerified: Boolean (default: false, indexed),
  otp: String (select: false, for security),
  otpExpiry: Date (select: false, indexed for cleanup),
  lastOTPSentAt: Date (select: false, for rate limiting),
  resetPasswordOTP: String (select: false, for password reset),
  resetPasswordOTPExpiry: Date (select: false, for password reset),
  lastResetOTPSentAt: Date (select: false, for rate limiting),
  // E2EE key material (zero-knowledge — server stores opaque blobs)
  publicKey: String (base64-encoded 32-byte NaCl box public key),
  encryptedPrivateKey: String (base64-encoded AES-GCM ciphertext of secret key),
  keyIv: String (base64-encoded 12-byte AES-GCM IV),
  keySalt: String (base64-encoded 16-byte PBKDF2 salt),
  contacts: [ObjectId] (ref: 'User', array of contact user IDs),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- email: 1 (unique)
- isVerified: 1 (for cleanup queries)
- otpExpiry: 1 (for expiration checks)
```

### ContactRequest Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required, indexed),
  receiverId: ObjectId (ref: 'User', required, indexed),
  status: String (enum: ['pending', 'accepted', 'declined'], default: 'pending', indexed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- senderId: 1
- receiverId: 1
- { senderId: 1, receiverId: 1 } (compound, unique - prevents duplicates)
- { receiverId: 1, status: 1 } (for efficient pending request queries)
```

### Message Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required, indexed),
  receiverId: ObjectId (ref: 'User', required, indexed),
  text: String (max: 5000 chars, trimmed — stores encrypted ciphertext when E2EE),
  image: String (URL, trimmed — plaintext Cloudinary URL),
  nonce: String (base64-encoded NaCl nonce — present when message is E2EE),
  isRead: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- senderId: 1
- receiverId: 1
- { senderId: 1, receiverId: 1, createdAt: -1 } (compound)

// Validation
- At least one of 'text' or 'image' must be present
- If 'nonce' is present, 'text' contains encrypted ciphertext (not plaintext)
```

### Entity Relationship Diagram

```
┌─────────────────────────┐
│         User            │
├─────────────────────────┤
│ _id: ObjectId (PK)      │
│ name: String            │
│ email: String (unique)  │
│ password: String        │
│ profilePic: String      │
│ contacts: [ObjectId]    │◄────┐
│ createdAt: Date         │     │
│ updatedAt: Date         │     │ many-to-many
└─────────────────────────┘     │ (self-referencing)
           │                    │
           │ 1                  │
           │                    │
           │ sends/receives     │
           │                    │
           │ *                  │
           ▼                    │
┌─────────────────────────┐     │
│       Message           │     │
├─────────────────────────┤     │
│ _id: ObjectId (PK)      │     │
│ senderId: ObjectId (FK) │─────┘
│ receiverId: ObjectId(FK)│─────┐
│ text: String            │     │
│ image: String           │     │
│ isRead: Boolean         │     │
│ createdAt: Date         │     │
│ updatedAt: Date         │     │
└─────────────────────────┘     │
                                │
           ┌────────────────────┘
           │
           ▼
┌─────────────────────────┐
│   ContactRequest        │
├─────────────────────────┤
│ _id: ObjectId (PK)      │
│ senderId: ObjectId (FK) │
│ receiverId: ObjectId(FK)│
│ status: String          │
│ createdAt: Date         │
│ updatedAt: Date         │
└─────────────────────────┘
```


---

## 🔒 Security Features

### 1. Arcjet Security Suite

Relay implements comprehensive security through Arcjet:

#### Bot Detection
- Blocks automated traffic and malicious bots
- Allows legitimate bots (search engines, monitoring services)
- Real-time threat detection

#### Rate Limiting
- Sliding window algorithm
- 500 requests per IP per 60-second window (balanced for UX and security)
- Automatic retry with exponential backoff on rate limit errors
- Prevents abuse and DDoS attacks while allowing legitimate users
- Fail-open strategy on service errors for better availability

#### Shield Protection
- SQL injection prevention
- XSS attack mitigation
- Common vulnerability protection

### 2. Authentication Security

```
┌─────────────────────────────────────────────────────────┐
│              Authentication Security Layers             │
├─────────────────────────────────────────────────────────┤
│  1. Password Hashing (bcrypt, 10 rounds)                │
│  2. JWT Token Generation (7-day expiry)                 │
│  3. HTTP-only Cookies (prevents XSS)                    │
│  4. Secure Flag (HTTPS only in production)              │
│  5. SameSite=Strict (CSRF protection)                   │
│  6. Token Verification on Protected Routes              │
└─────────────────────────────────────────────────────────┘
```

### 3. Input Validation

- Request body validation
- File type and size validation for images
- MongoDB ObjectId validation
- Email format validation
- Password strength requirements

### 4. Error Handling

- Sanitized error messages (no sensitive data exposure)
- Different error handling for development vs production
- Comprehensive logging for debugging
- Graceful degradation on service failures

### 5. CORS Configuration

```javascript
// Development: localhost:5173
// Production: Configured CLIENT_URL only
{
  origin: process.env.CLIENT_URL,
  credentials: true
}
```

### 6. End-to-End Encryption (E2EE)

Relay implements **true zero-knowledge end-to-end encryption** — the server never has access to plaintext message content or private encryption keys. Even if the server is compromised, your conversations remain private.

#### 🔐 Cryptographic Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    E2EE Cryptographic Stack                          │
├─────────────────────────────────────────────────────────────────────┤
│  Key Exchange:      X25519 (Curve25519 ECDH)                        │
│  Encryption:        XSalsa20-Poly1305 (NaCl box — authenticated)    │
│  Key Wrapping:      AES-256-GCM (Web Crypto API)                    │
│  Key Derivation:    PBKDF2-SHA256 (100,000 iterations)              │
│  Recovery:          BIP39 12-word mnemonic → 512-bit seed           │
│  Session Cache:     IndexedDB + sessionStorage (encrypted)          │
│  Nonce Generation:  24-byte cryptographically random per message    │
└─────────────────────────────────────────────────────────────────────┘
```

#### 🛡️ How It Works

**Your messages are safe because:**

1. **Messages are encrypted on your device** before they ever leave your browser. The server only receives unreadable ciphertext.
2. **The server is zero-knowledge** — it stores encrypted blobs of your private key but can never decrypt them (they're locked with your password).
3. **Only you and your conversation partner** have the keys needed to read messages.
4. **A 12-word recovery phrase** lets you restore access to your encrypted messages if you change devices or forget your password.
5. **Unique nonces per message** prevent replay attacks and ensure forward secrecy.
6. **Authenticated encryption** (Poly1305 MAC) ensures messages haven't been tampered with.

#### 🔄 Key Lifecycle

| Event | What Happens |
|-------|-------------|
| **Signup** | 1. Client generates BIP39 recovery phrase (12 words)<br>2. Derives 512-bit seed → first 32 bytes = secret key<br>3. Generates X25519 key pair from secret key<br>4. Encrypts private key with password (AES-256-GCM + PBKDF2 100k iterations)<br>5. Stores encrypted blob + public key on server<br>6. Shows recovery phrase modal (user must save it) |
| **Login** | 1. Server returns encrypted key blob + public key<br>2. Client decrypts private key with password<br>3. Keys cached in IndexedDB (session-encrypted)<br>4. Ready to encrypt/decrypt messages |
| **Page Refresh** | Keys restored from IndexedDB session cache (no password prompt) |
| **Send Message** | 1. Generate random 24-byte nonce<br>2. Encrypt text with nacl.box(text, nonce, receiverPK, senderSK)<br>3. Send ciphertext + nonce to server<br>4. Server stores opaque blob (never sees plaintext) |
| **Receive Message** | 1. Receive ciphertext + nonce from server<br>2. Decrypt with nacl.box.open(ciphertext, nonce, senderPK, receiverSK)<br>3. Display plaintext in UI |
| **Password Change** | 1. Private key re-encrypted with new password<br>2. Updated blob sent to server<br>3. Old password no longer works |
| **Forgot Password (with phrase)** | 1. User enters 12-word recovery phrase<br>2. Re-derives original key pair (deterministic)<br>3. Re-encrypts with new password<br>4. All old messages remain readable |
| **Forgot Password (no phrase)** | 1. New key pair generated<br>2. Old encrypted messages become permanently unreadable<br>3. Fresh start with new encryption keys |
| **Logout** | All keys cleared from memory, IndexedDB, and sessionStorage |

#### 🔒 What Is Encrypted vs. What Is Not

| Content | Encrypted? | Algorithm | Details |
|---------|:----------:|-----------|---------|
| Message text | ✅ | NaCl box (X25519 + XSalsa20-Poly1305) | Encrypted client-side before transmission |
| Private key at rest | ✅ | AES-256-GCM + PBKDF2 (100k iterations) | Password-protected, server stores opaque blob |
| Private key in transit | ✅ | AES-256-GCM ciphertext | Only encrypted blob transmitted |
| Image files | ❌ | N/A | Uploaded to Cloudinary server-side (known limitation) |
| Image URLs | ❌ | N/A | Stored as plaintext Cloudinary URLs |
| Message metadata | ❌ | N/A | senderId, receiverId, timestamps, read status, nonce |
| Public keys | ❌ | N/A | Public data by design — shared openly for key exchange |

> **⚠️ Known Limitation:** Image encryption is not currently implemented. Since the server handles Cloudinary uploads, images are stored unencrypted. Fully encrypting images would require client-side encryption and direct-to-Cloudinary uploads with signed presets. Text messages remain fully encrypted.

#### 🔑 Recovery Phrase

After signup, users receive a **12-word BIP39 mnemonic** (e.g., `abandon ability cable damage enjoy ...`). This phrase:

- **Deterministically derives** the same key pair every time (512-bit seed → 32-byte secret key)
- Is the **only way** to recover encrypted messages if the password is forgotten
- Is **never stored** on the server — only the user has it
- Must be **written down and stored securely** by the user (offline backup recommended)
- Follows the **BIP39 standard** used by cryptocurrency wallets (proven security model)
- Can be validated using BIP39 checksum (last word contains checksum bits)

**Security Best Practices:**
- ✅ Write down the phrase on paper (not digital)
- ✅ Store in a secure location (safe, safety deposit box)
- ✅ Never share with anyone (not even support staff)
- ✅ Never store in cloud services or password managers
- ❌ Don't take screenshots or photos
- ❌ Don't email or message the phrase

#### 🔬 Technical Details

**Encryption Process (nacl.box):**
```
1. Generate random 24-byte nonce
2. Compute shared secret: X25519(senderSK, receiverPK)
3. Derive encryption key: HSalsa20(shared_secret, nonce[0:16])
4. Encrypt: XSalsa20(plaintext, key, nonce)
5. Authenticate: Poly1305(ciphertext, key)
6. Output: ciphertext || mac (authenticated encryption)
```

**Key Wrapping Process (AES-GCM):**
```
1. Generate random 16-byte salt
2. Derive AES key: PBKDF2-SHA256(password, salt, 100k iterations)
3. Generate random 12-byte IV
4. Encrypt: AES-256-GCM(privateKey, key, IV)
5. Output: ciphertext || auth_tag (authenticated encryption)
```

**Why These Algorithms?**
- **X25519**: Fast, secure elliptic curve Diffie-Hellman (ECDH) for key exchange
- **XSalsa20-Poly1305**: Fast authenticated encryption with strong security guarantees
- **AES-256-GCM**: Industry-standard authenticated encryption for key wrapping
- **PBKDF2**: Slow key derivation to resist brute-force attacks on passwords
- **BIP39**: Proven standard for human-readable key backup (used by billions in crypto)

> 📖 **For detailed technical documentation**, see [E2EE-SECURITY.md](E2EE-SECURITY.md) — includes cryptographic specifications, threat model, security audit, and best practices.


---

## 📞 Voice & Video Calling

Relay supports **peer-to-peer voice and video calls** powered by WebRTC, with full call controls including mute, camera toggle, camera flip (mobile), and call duration tracking.

### Architecture

```
┌──────────────┐                                    ┌──────────────┐
│   Caller     │                                    │   Receiver   │
│              │                                    │              │
│  getUserMedia│                                    │  getUserMedia│
│  (mic/cam)   │                                    │  (mic/cam)   │
│              │      Socket.IO Signaling           │              │
│  ┌─────────┐ │  ──call:initiate──────────────▶    │ ┌──────────┐ │
│  │  WebRTC │ │                                    │ │  WebRTC  │ │
│  │  Peer   │ │  ◀──call:accepted─────────────     │ │  Peer    │ │
│  │  Conn   │ │  ──call:offer───────────────▶      │ │  Conn    │ │
│  │         │ │  ◀──call:answer─────────────       │ │          │ │
│  │         │ │  ◀─call:ice-candidate──▶           │ │          │ │
│  └────┬────┘ │                                    │ └────┬─────┘ │
│       │      │                                    │      │       │
└───────┼──────┘                                    └──────┼───────┘
        │                                                  │
        │          Direct P2P Media Connection             │
        │  ◀═══════════════════════════════════════════▶   │
        │         Audio/Video (DTLS-SRTP encrypted)        │
        │                                                  │
```

### Call Flow

```mermaid
sequenceDiagram
    participant Caller
    participant Server
    participant Receiver

    Caller->>Caller: getUserMedia (mic + optional cam)
    Caller->>Server: call:initiate (receiverId, callType)
    Server->>Receiver: call:incoming (callerName, callerPic, callType)
    Note over Receiver: Shows IncomingCallModal

    alt Call Accepted
        Receiver->>Receiver: getUserMedia (mic + optional cam)
        Receiver->>Server: call:accepted (callerId)
        Server->>Caller: call:accepted
        Caller->>Caller: Create RTCPeerConnection + add tracks
        Caller->>Server: call:offer (SDP offer)
        Server->>Receiver: call:offer
        Receiver->>Receiver: Create RTCPeerConnection + add tracks
        Receiver->>Receiver: Set remote description (offer)
        Receiver->>Server: call:answer (SDP answer)
        Server->>Caller: call:answer
        Caller->>Caller: Set remote description (answer)
        Note over Caller,Receiver: ICE candidates exchanged via call:ice-candidate
        Note over Caller,Receiver: P2P media connection established (DTLS-SRTP)
    else Call Rejected
        Receiver->>Server: call:rejected
        Server->>Caller: call:rejected
    else No Answer (30s timeout)
        Caller->>Caller: Auto-end call
    end
```

### Call Features

| Feature | Description |
|---------|-------------|
| **Voice Calls** | Full-duplex audio via WebRTC with hidden `<audio>` element |
| **Video Calls** | Live video with local PiP preview and remote fullscreen |
| **Mute** | Toggle microphone on/off, synced to remote peer |
| **Camera Toggle** | Turn camera on/off during video calls |
| **Camera Flip** | Switch front↔back camera on mobile (device enumeration fallback) |
| **Call Timer** | Duration counter starts when P2P connection established |
| **Auto-timeout** | Unanswered calls auto-end after 30 seconds |
| **Busy Detection** | If receiver is already in a call, caller gets "User is busy" |
| **Offline Detection** | If receiver is offline, caller gets "User is offline" |
| **Disconnection Recovery** | 5-second grace period for temporary network drops |
| **Controls Auto-hide** | Video call controls fade out after 4 seconds of inactivity |

### ICE Server Configuration

Currently using Google STUN servers for NAT traversal:

```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
]
```

> **⚠️ Note:** STUN-only configuration. Calls may fail if both users are behind symmetric NATs (corporate networks, some carriers). Adding a TURN server is recommended for production deployments with enterprise users.

### Call Security

- **DTLS-SRTP**: All audio/video media is encrypted in transit by default (WebRTC standard)
- **Signaling Relay**: The server only relays SDP offers/answers and ICE candidates — never touches actual media
- **Direct P2P**: Once connected, audio/video flows directly between peers without passing through the server


---

## 🔄 Real-Time Communication

### Socket.IO Implementation

#### Connection Flow

```
1. Client connects with JWT cookie
2. Server validates JWT from cookie
3. Server authenticates user from database
4. Connection established
5. User added to online users map
6. Broadcast updated online users list
```

#### Online User Tracking

```javascript
// Server maintains a Map
onlineUsers: Map<userId, socketId>

// When user connects
onlineUsers.set(userId, socketId)
io.emit('getOnlineUsers', Array.from(onlineUsers.keys()))

// When user disconnects
onlineUsers.delete(userId)
io.emit('getOnlineUsers', Array.from(onlineUsers.keys()))
```

#### Typing Indicators

```
User A starts typing → Emit 'typing' → Server → Emit 'userTyping' → User B
User A stops typing → Emit 'stopTyping' → Server → Emit 'userStopTyping' → User B
```

#### Message Delivery

```
1. User A sends message via HTTP POST
2. Server saves to database
3. Server responds to User A
4. Server finds User B's socket ID
5. Server emits 'newMessage' to User B's socket
6. User B receives message in real-time
```

### State Management (Zustand)

#### Store Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Stores                      │
├─────────────────────────────────────────────────────────┤
│  useAuthStore                                           │
│  - user, isAuthenticated, isLoading                     │
│  - signup(), login(), logout(), checkAuth()             │
├─────────────────────────────────────────────────────────┤
│  useChatStore                                           │
│  - contacts, messages, selectedContact                  │
│  - fetchContacts(), fetchMessages(), sendMessage()      │
│  - lastMessages, unreadCounts                           │
├─────────────────────────────────────────────────────────┤
│  useContactStore                                        │
│  - pendingRequests, sentRequests, isLoadingRequests     │
│  - sendContactRequest(), acceptRequest()                │
│  - declineRequest(), cancelRequest(), removeContact()   │
├─────────────────────────────────────────────────────────┤
│  useSocketStore                                         │
│  - socket, onlineUsers, typingUsers                     │
│  - connectSocket(), disconnectSocket()                  │
│  - emitTyping(), emitStopTyping()                       │
│  - WebRTC call event listeners                          │
├─────────────────────────────────────────────────────────┤
│  useCallStore                                           │
│  - callStatus, callType, remoteUser, localStream        │
│  - isMuted, isVideoOff, callDuration, remoteStream      │
│  - initiateCall(), acceptCall(), rejectCall(), endCall()│
│  - toggleMute(), toggleVideo(), flipCamera()            │
│  - WebRTC peer connection management                    │
├─────────────────────────────────────────────────────────┤
│  useThemeStore                                          │
│  - theme (light/dark mode)                              │
├─────────────────────────────────────────────────────────┤
│  useUIStore                                             │
│  - imagePreview, modals, UI state                       │
└─────────────────────────────────────────────────────────┘
```


---

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# This will:
# 1. Install backend dependencies
# 2. Install frontend dependencies
# 3. Build frontend (creates /frontend/dist)
```

### Deployment Options

#### Option 1: Deploy to Render/Railway/Heroku

1. **Prepare Environment Variables**
   - Set all required environment variables in platform dashboard
   - Set `NODE_ENV=production`

2. **Configure Build Command**
   ```bash
   npm run build
   ```

3. **Configure Start Command**
   ```bash
   npm start
   ```

4. **Port Configuration**
   - The app uses `process.env.PORT` or defaults to 3000
   - Most platforms automatically set PORT

#### Option 2: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. **Install Node.js and MongoDB**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/relay.git
   cd relay
   npm run build
   ```

3. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/server.js --name relay
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx as Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```


#### Option 3: Deploy to Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Render):**
- Connect GitHub repository
- Set root directory to `backend`
- Configure environment variables
- Deploy

### Environment Variables Checklist for Production

- [ ] `NODE_ENV=production`
- [ ] `PORT` (usually auto-set by platform)
- [ ] `MONGO_URI` (MongoDB Atlas connection string)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `RESEND_API_KEY`
- [ ] `SENDER_EMAIL`
- [ ] `SENDER_NAME`
- [ ] `CLIENT_URL` (your frontend domain)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `ARCJET_KEY`
- [ ] `ARCJET_ENV=production`

### Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test message sending (text and images)
- [ ] Verify WebSocket connection
- [ ] Test real-time features (online status, typing indicators)
- [ ] Test voice and video calling between two users
- [ ] Test camera flip on mobile devices
- [ ] Check email delivery (welcome emails)
- [ ] Verify image uploads to Cloudinary
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Setup monitoring (e.g., Sentry, LogRocket)
- [ ] Configure database backups


---

## 📁 Project Structure

```
relay/
├── backend/
│   ├── scripts/
│   │   ├── cleanupUnverifiedUsers.js  # Manual cleanup script
│   │   └── resetDatabase.js           # Database reset script
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Environment configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Authentication logic (with OTP)
│   │   │   ├── contact.controller.js  # Contact request logic
│   │   │   └── message.controller.js  # Message handling logic
│   │   ├── emails/
│   │   │   ├── emailHandlers.js       # Email sending functions
│   │   │   └── emailTemplates.js      # Email HTML templates (OTP + Welcome)
│   │   ├── lib/
│   │   │   ├── arcjet.js              # Arcjet security config
│   │   │   ├── cloudinary.js          # Cloudinary config
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   ├── generateToken.js       # JWT token generation
│   │   │   ├── resend.js              # Resend email config
│   │   │   └── socket.js              # Socket.IO setup
│   │   ├── middleware/
│   │   │   ├── arcjet.middleware.js   # Arcjet protection middleware
│   │   │   └── auth.middleware.js     # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── contactRequest.model.js # Contact request schema
│   │   │   ├── message.model.js       # Message schema
│   │   │   └── user.model.js          # User schema (with OTP + contacts)
│   │   ├── routes/
│   │   │   ├── auth.route.js          # Authentication routes (with OTP)
│   │   │   ├── contact.route.js       # Contact request routes
│   │   │   └── message.route.js       # Message routes
│   │   ├── services/
│   │   │   └── cleanupService.js      # Automatic cleanup service
│   │   └── server.js                  # Express server entry point
│   ├── .env                           # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── relay-icon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── call/
│   │   │   │   ├── CallView.jsx       # Active call UI (video/voice)
│   │   │   │   ├── CallView.css       # Call view styling
│   │   │   │   ├── IncomingCallModal.jsx  # Incoming call notification
│   │   │   │   └── IncomingCallModal.css  # Incoming call styling
│   │   │   ├── chat/
│   │   │   │   ├── ChatHeader.jsx     # Chat header component (+ call buttons)
│   │   │   │   ├── EmptyChat.jsx      # Empty state component
│   │   │   │   ├── MessageBubble.jsx  # Individual message component
│   │   │   │   ├── MessageInput.jsx   # Message input component
│   │   │   │   └── MessageList.jsx    # Messages list component
│   │   │   ├── shared/
│   │   │   │   ├── AddContactModal.jsx      # Add contact modal
│   │   │   │   ├── AddContactModal.css      # Modal styling
│   │   │   │   ├── Avatar.jsx               # User avatar component
│   │   │   │   ├── Button.jsx               # Reusable button component
│   │   │   │   ├── ContactRequestsModal.jsx # Contact requests modal
│   │   │   │   ├── ContactRequestsModal.css # Modal styling
│   │   │   │   ├── ForgotPasswordModal.jsx  # Password reset modal
│   │   │   │   ├── ForgotPasswordModal.css  # Modal styling
│   │   │   │   ├── ImageLightbox.jsx        # Image preview modal
│   │   │   │   ├── Input.jsx                # Reusable input component
│   │   │   │   ├── Logo.jsx                 # App logo component
│   │   │   │   ├── VerificationModal.jsx    # OTP verification modal
│   │   │   │   └── VerificationModal.css    # Modal styling
│   │   │   └── sidebar/
│   │   │       └── Sidebar.jsx        # Contacts sidebar
│   │   ├── lib/
│   │   │   ├── api.js                 # Axios instance & interceptors
│   │   │   ├── constants.js           # API endpoints constants
│   │   │   └── utils.js               # Utility functions
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx           # Login/Signup page
│   │   │   ├── ChatPage.jsx           # Main chat page
│   │   │   └── ProfilePage.jsx        # User profile page
│   │   ├── store/
│   │   │   ├── useAuthStore.js        # Authentication state
│   │   │   ├── useCallStore.js        # Call state & WebRTC logic
│   │   │   ├── useChatStore.js        # Chat state
│   │   │   ├── useContactStore.js     # Contact request state
│   │   │   ├── useSocketStore.js      # WebSocket state (+ call signaling)
│   │   │   ├── useThemeStore.js       # Theme state
│   │   │   └── useUIStore.js          # UI state
│   │   ├── App.jsx                    # Root component
│   │   ├── index.css                  # Global styles
│   │   └── main.jsx                   # React entry point
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .git/
├── package.json                       # Root package.json
└── README.md                          # This file
```


---

## 🎨 Features Deep Dive

### 1. User Authentication & Email Verification

**Signup Flow:**
1. User submits registration form (name, email, password)
2. Arcjet validates request (bot detection, rate limiting)
3. Server validates input data (format, length, strength)
4. Check if email already exists in database
5. Hash password with bcrypt (10 rounds in dev, 12 in production)
6. Generate cryptographically secure 6-digit OTP using `crypto.randomInt()`
7. Set OTP expiry (10 minutes from now)
8. Record `lastOTPSentAt` timestamp for rate limiting
9. Create user in MongoDB with `isVerified: false`
10. Send OTP email via Resend (professional template)
11. Return user data to client (no JWT token yet - user must verify first)
12. Client shows animated verification modal

**Email Verification Flow:**
1. User receives OTP email (6-digit code, 10-minute expiry)
2. User enters code in verification modal (auto-focus, auto-submit)
3. Client sends verification request to `/api/auth/verify-email`
4. Server validates OTP format (must be 6 digits)
5. Server finds user and checks if already verified
6. Server checks OTP expiry (must be within 10 minutes)
7. Server compares OTP using `crypto.timingSafeEqual()` (timing attack prevention)
8. Mark user as verified, clear OTP fields (`otp`, `otpExpiry`, `lastOTPSentAt`)
9. Generate JWT token (7-day expiry)
10. Set HTTP-only secure cookie with SameSite=Strict
11. Send welcome email asynchronously (non-blocking)
12. Return user data to client with token
13. Client redirects to chat page and connects WebSocket

**OTP Resend Flow:**
1. User clicks "Resend Code" button
2. Client sends request to `/api/auth/resend-otp`
3. Server checks if user is already verified (reject if yes)
4. Server checks rate limit using `lastOTPSentAt` (must be > 60 seconds)
5. If rate limited, return 429 with `retryAfter` seconds
6. Generate new cryptographically secure 6-digit OTP
7. Update user with new OTP, expiry, and `lastOTPSentAt`
8. Send new OTP email via Resend
9. Client shows 60-second countdown timer
10. User can resend again after cooldown expires

**Login Flow:**
1. User submits credentials (email, password)
2. Arcjet validates request (bot detection, rate limiting)
3. Server validates input format
4. Find user by email (case-insensitive)
5. Compare password with bcrypt hash
6. Check if user is verified (`isVerified: true`)
7. If not verified:
   - Return 403 with `requiresVerification: true` flag
   - Client shows verification modal
   - User can resend OTP or enter existing OTP
8. If verified:
   - Generate JWT token (7-day expiry)
   - Set HTTP-only secure cookie
   - Return user data to client
   - Client connects WebSocket

**Security Features:**
- ✅ Cryptographically secure OTP generation (`crypto.randomInt()`)
- ✅ Constant-time OTP comparison (`crypto.timingSafeEqual()` - prevents timing attacks)
- ✅ Buffer length validation (prevents server crashes)
- ✅ 10-minute OTP expiration (time-limited validity)
- ✅ 60-second rate limiting on resend (prevents abuse)
- ✅ Accurate rate limiting with `lastOTPSentAt` field
- ✅ OTP fields hidden from API responses (`select: false`)
- ✅ Email enumeration prevention (generic error messages)
- ✅ Single-use OTPs (cleared after verification)
- ✅ XSS prevention in email templates (escapes all special chars including backticks)
- ✅ Database indexes for performance (`isVerified`, `otpExpiry`)
- ✅ Automatic cleanup of unverified users (every 6 hours, > 24 hours old)

### 2. Contact Request System & Privacy

**Architecture:**

The contact system implements a privacy-first approach where users must explicitly connect before messaging. This prevents spam and gives users full control over their communications.

**Database Design:**

```javascript
// User Model - contacts array
{
  contacts: [ObjectId] // Array of user IDs who are contacts
}

// ContactRequest Model
{
  senderId: ObjectId,    // Who sent the request
  receiverId: ObjectId,  // Who received it
  status: 'pending' | 'accepted' | 'declined'
}
```

**Request Lifecycle:**

```
1. User A searches for User B
   ↓
2. User A sends contact request
   ↓
3. User B receives real-time notification
   ↓
4. User B can Accept or Decline
   ↓
5a. If Accepted:
    - Both users added to each other's contacts
    - Request status updated to 'accepted'
    - Both users can now message
    - Real-time notification to User A
   ↓
5b. If Declined:
    - Request status updated to 'declined'
    - Can be resent later
```

**Privacy Enforcement:**

```javascript
// Backend validates on EVERY message operation
// 1. Get Messages
if (!isContact) {
  return 403: "You can only view messages with your contacts"
}

// 2. Send Message
if (!isContact) {
  return 403: "You can only message your contacts"
}
```

**Sidebar Design (Discord-Style):**

```
┌─────────────────────────────────┐
│  Relay    [+] [📥2] [◄]         │ ← Header with actions
├─────────────────────────────────┤
│ [Messages (3)] [All Contacts]   │ ← Two tabs
├─────────────────────────────────┤
│ 🔍 Search contacts...           │ ← Search bar
├─────────────────────────────────┤
│ Messages Tab:                   │
│  • Alice [3]  2:30 PM  ← Unread │
│  • Bob        1:15 PM           │
│  • Charlie    Yesterday         │
├─────────────────────────────────┤
│ All Contacts Tab:               │
│  • Alice                        │
│  • Bob                          │
│  • Charlie                      │
│  • Diana      ● Online          │
│  • Eve        eve@email.com     │
└─────────────────────────────────┘
```

**Features:**
- **Messages Tab**: Shows only contacts with message history, sorted by unread first then most recent
- **All Contacts Tab**: Shows all contacts alphabetically
- **Search**: Works across both tabs
- **Collapsed Mode**: All action buttons remain accessible
- **Real-Time Badges**: Shows pending request count
- **Smart Empty States**: Context-aware messages

**Edge Cases Handled:**
- ✅ Duplicate request prevention
- ✅ Can't send request to yourself
- ✅ Can't message non-contacts
- ✅ Real-time notification when removed as contact
- ✅ Chat clears when contact removed
- ✅ Loading states prevent double-clicks
- ✅ Search resets when switching tabs
- ✅ Proper ObjectId comparison (`.some()` with `.toString()`)
- ✅ Error handling in all socket events

### 3. Real-Time Messaging

**Message Sending:**
1. User types message and/or selects image
2. Client validates input
3. If image: Convert to base64
4. Send POST request to `/api/message/send/:id`
5. Server validates JWT
6. If image: Upload to Cloudinary (optimized)
7. Save message to MongoDB
8. Find receiver's socket ID
9. Emit 'newMessage' event to receiver
10. Update UI for both users

**Read Receipts:**
1. User opens conversation
2. Client sends PATCH to `/api/message/read/:id`
3. Server marks all messages from that user as read
4. Server emits 'messagesRead' event to sender
5. Sender's UI updates to show read status

### 4. Image Handling

**Upload Process:**
1. User selects image
2. Client validates file type and size
3. Convert to base64
4. Send with message
5. Server validates base64 format
6. Upload to Cloudinary with transformations:
   - Max dimensions: 1200x1200
   - Auto quality optimization
   - Auto format selection (WebP when supported)
7. Store Cloudinary URL in database
8. Return URL to client

**Supported Formats:**
- JPEG/JPG
- PNG
- WebP
- GIF

**Size Limits:**
- Maximum: 10MB per image


### 5. Online Status & Presence

**Implementation:**
```javascript
// Server maintains online users map
const onlineUsers = new Map(); // userId -> socketId

// On connection
onlineUsers.set(userId, socketId);
io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

// On disconnection
onlineUsers.delete(userId);
io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
```

**Client Usage:**
```javascript
const { onlineUsers } = useSocketStore();
const isOnline = onlineUsers.includes(contact._id);
```

### 6. Typing Indicators

**Flow:**
```
User starts typing
  ↓
Debounced event (300ms)
  ↓
Emit 'typing' to server
  ↓
Server forwards to receiver
  ↓
Receiver shows indicator
  ↓
User stops typing (1s timeout)
  ↓
Emit 'stopTyping'
  ↓
Receiver hides indicator
```

### 7. Unread Message Counters

**Implementation:**
1. Fetch all messages for each contact
2. Count messages where:
   - `senderId !== currentUserId` (received messages)
   - `isRead === false` (not yet read)
3. Store in `unreadCounts` state
4. Display badge on contact
5. Clear count when conversation opened

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with valid credentials
- [ ] Receive OTP email after signup
- [ ] Verify email with correct OTP
- [ ] Verify email with incorrect OTP (should fail)
- [ ] Verify email with expired OTP (should fail)
- [ ] Resend OTP functionality
- [ ] Rate limiting on OTP resend (60-second cooldown)
- [ ] Login with unverified account (should show verification modal)
- [ ] Login with verified account (should succeed)
- [ ] Sign up with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Logout functionality
- [ ] Protected routes redirect when not authenticated
- [ ] JWT token persists across page refreshes

**Contact System:**
- [ ] Search for users by name or email
- [ ] Send contact request to another user
- [ ] Receive contact request notification (real-time)
- [ ] View pending requests in Inbox modal
- [ ] Accept contact request
- [ ] Decline contact request
- [ ] Cancel sent request
- [ ] Remove contact from chat header menu
- [ ] Try to message non-contact (should fail with error)
- [ ] Try to send duplicate request (should fail)
- [ ] Try to send request to yourself (should fail)
- [ ] Contact removed notification (real-time)
- [ ] Sidebar shows correct tabs (Messages + All Contacts)
- [ ] Messages tab shows only contacts with history
- [ ] All Contacts tab shows all contacts alphabetically
- [ ] Search works in both tabs
- [ ] Switching tabs clears search
- [ ] Collapsed sidebar shows all action buttons
- [ ] Notification badge shows pending request count

**Messaging:**
- [ ] Send text message to contact
- [ ] Send image message to contact
- [ ] Send message with both text and image
- [ ] Receive messages in real-time
- [ ] Messages persist after refresh
- [ ] Message timestamps display correctly
- [ ] Read receipts update correctly
- [ ] Unread badge shows correct count
- [ ] Unread count clears when opening chat

**Real-Time Features:**
- [ ] Online status updates immediately
- [ ] Typing indicators appear and disappear
- [ ] Multiple tabs/devices sync correctly
- [ ] Reconnection after network loss

**Voice & Video Calling:**
- [ ] Initiate voice call to online contact
- [ ] Initiate video call to online contact
- [ ] Receive incoming call notification (modal appears)
- [ ] Accept incoming voice call
- [ ] Accept incoming video call
- [ ] Decline incoming call
- [ ] End call from either side
- [ ] Call auto-ends after 30s if unanswered
- [ ] Mute/unmute during call (both sides notified)
- [ ] Camera toggle during video call
- [ ] Camera flip (front↔back) on mobile device
- [ ] Call timer counts correctly
- [ ] Call to offline user shows "User is offline"
- [ ] Call to busy user shows "User is busy"
- [ ] Temporary network drop recovers within 5s
- [ ] Call controls auto-hide during connected video call
- [ ] Local PiP video preview displays correctly
- [ ] Voice call plays audio via hidden audio element

**UI/UX:**
- [ ] Responsive design on mobile
- [ ] Smooth animations
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Image lightbox works
- [ ] Theme switching (if implemented)


---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:** `Error connecting to MongoDB`

**Solutions:**
- Check if MongoDB is running locally: `sudo systemctl status mongod`
- Verify `MONGO_URI` in `.env` file
- Check network connectivity for MongoDB Atlas
- Whitelist your IP in MongoDB Atlas
- Verify credentials in connection string

#### 2. Socket Connection Failed

**Error:** `Socket connection error` or `WebSocket connection failed`

**Solutions:**
- Ensure backend server is running
- Check CORS configuration
- Verify JWT cookie is being sent
- Check browser console for specific errors
- Ensure port 3000 is not blocked by firewall

#### 3. Images Not Uploading

**Error:** `Failed to upload image`

**Solutions:**
- Verify Cloudinary credentials in `.env`
- Check image size (must be < 10MB)
- Verify image format (JPEG, PNG, WebP, GIF)
- Check Cloudinary dashboard for quota limits
- Ensure base64 encoding is correct

#### 4. Emails Not Sending

**Error:** `Failed to send welcome email`

**Solutions:**
- Verify Resend API key
- Check sender email is verified in Resend dashboard
- Verify domain configuration
- Check Resend dashboard for error logs
- Ensure email format is valid

#### 5. Arcjet Blocking Requests

**Error:** `Access denied` or `Rate limit exceeded`

**Solutions:**
- Check Arcjet dashboard for blocked requests
- Verify Arcjet key is correct
- Adjust rate limit settings if needed
- In development, set `ARCJET_ENV=development`
- Check IP whitelist settings

#### 6. JWT Token Issues

**Error:** `Unauthorized - Invalid token`

**Solutions:**
- Clear browser cookies
- Verify `JWT_SECRET` is set
- Check token expiration (7 days default)
- Ensure cookie is HTTP-only and secure
- Verify SameSite settings

#### 7. Email Verification Issues

**Error:** `OTP not received` or `Verification email not delivered`

**Solutions:**
- Check spam/junk folder
- Verify Resend API key is correct
- Check sender email is verified in Resend dashboard
- Verify domain configuration in Resend
- Check Resend dashboard for delivery logs
- Ensure email format is valid
- Try resending OTP

**Error:** `Invalid OTP` or `OTP expired`

**Solutions:**
- Ensure OTP is entered correctly (6 digits)
- Check if OTP has expired (10-minute window)
- Request a new OTP using "Resend Code"
- Verify server time is correct
- Check database for OTP and expiry values

**Error:** `Rate limit exceeded` when resending OTP

**Solutions:**
- Wait 60 seconds before requesting new OTP
- Check countdown timer in UI
- Verify rate limiting is working correctly
- In development, you can adjust cooldown time in controller

#### 8. "Too Many Requests" Errors

**Error:** `Too many requests. Please try again later.`

**Solutions:**
- The app now has automatic retry - wait a few seconds
- Rate limit is 500 requests per minute (should be sufficient for normal use)
- If persistent, check Arcjet dashboard for issues
- Verify Arcjet service is responding (check backend logs)
- In development, ensure `ARCJET_ENV=development` is set
- Clear browser cache and cookies
- Wait 60 seconds for rate limit to reset

**Note:** The application now has improved rate limiting (500 requests per minute) with automatic retry logic for better user experience while maintaining security.

#### 9. Contact System Issues

**Error:** `You can only message your contacts`

**Solutions:**
- Ensure you've sent a contact request
- Verify the other user accepted your request
- Check if contact was removed
- Refresh the page to sync contacts list

**Error:** `Contact request already pending`

**Solutions:**
- Check the "Sent Requests" section in Inbox modal
- Wait for the other user to accept or decline
- You can cancel the request and send a new one

**Error:** `Already in your contacts`

**Solutions:**
- The user is already a contact
- Check the "All Contacts" tab in sidebar
- You can message them directly

**Issue:** Contact requests not showing up

**Solutions:**
- Check if socket is connected (look for green "Online" status)
- Refresh the page to reconnect socket
- Check backend logs for socket errors
- Verify JWT cookie is valid
- Click the Inbox icon to manually refresh requests

**Issue:** Removed contact still appears in sidebar

**Solutions:**
- Refresh the page
- Check if the removal was successful (should see success toast)
- Verify backend logs for errors
- Check MongoDB to confirm contact was removed from both users

### Debug Mode

Enable detailed logging:

```javascript
// backend/src/server.js
if (config.isDevelopment()) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```


---

## 🔮 Future Enhancements

### Planned Features

#### ✅ Completed Features
- [x] **End-to-End Encryption**: Zero-knowledge E2EE with NaCl box (✅ Implemented)
- [x] **Recovery Phrase**: BIP39 12-word mnemonic for key backup (✅ Implemented)
- [x] **Email Verification**: Secure OTP-based email verification (✅ Implemented)
- [x] **Password Reset**: Forgot password with OTP verification and key recovery (✅ Implemented)
- [x] **Smart Rate Limiting**: Balanced protection with automatic retry (✅ Implemented)
- [x] **Contact Request System**: Privacy-first messaging with mutual consent (✅ Implemented)
- [x] **Dark/Light Theme**: System-aware theme switching (✅ Implemented)
- [x] **Voice & Video Calling**: P2P calling with WebRTC, camera flip, and Obsidian-themed UI (✅ Implemented)

#### 🚧 In Progress / Planned
- [ ] **Image Encryption**: Client-side image encryption before upload
- [ ] **Group Chats**: Create and manage encrypted group conversations
- [ ] **Voice Messages**: Record and send encrypted audio messages
- [ ] **TURN Server**: Relay server for calls behind symmetric NATs
- [ ] **Call E2EE**: Application-level encryption for calls using WebRTC Insertable Streams
- [ ] **File Sharing**: Send encrypted documents, PDFs, and other files
- [ ] **Message Reactions**: React to messages with emojis
- [ ] **Message Editing**: Edit sent messages (with encryption)
- [ ] **Message Deletion**: Delete messages for everyone
- [ ] **Search Functionality**: Search encrypted messages (client-side indexing)
- [ ] **Push Notifications**: Browser and mobile push notifications
- [ ] **Message Forwarding**: Forward encrypted messages to other contacts
- [ ] **User Status**: Custom status messages
- [ ] **Last Seen**: Show when user was last active
- [ ] **Blocked Users**: Block and unblock functionality
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Admin Dashboard**: User management and analytics
- [ ] **Message Scheduling**: Schedule encrypted messages for later
- [ ] **Auto-delete Messages**: Temporary messages feature (self-destructing)
- [ ] **Disappearing Messages**: Configurable message expiration
- [ ] **Screenshot Detection**: Warn users when screenshots are taken (mobile)
- [ ] **Key Verification**: QR code-based public key verification (TOFU)

### Performance Optimizations

- [ ] **Message Pagination**: Implement virtual scrolling for large message histories
- [ ] **Redis Caching**: Cache user sessions, online status, and frequently accessed data
- [ ] **Database Optimization**: Optimize queries with aggregation pipelines and proper indexing
- [ ] **CDN Integration**: Serve static assets via CDN for faster global delivery
- [ ] **Service Worker**: Add offline support and background sync for messages
- [ ] **Lazy Loading**: Implement lazy loading for images and message history
- [ ] **Compression**: Add gzip/brotli compression middleware
- [ ] **Code Splitting**: Optimize bundle size with dynamic imports and route-based splitting
- [ ] **Image Optimization**: Implement progressive image loading and WebP format
- [ ] **WebSocket Optimization**: Implement message batching and compression
- [ ] **IndexedDB Optimization**: Optimize encrypted key storage and message caching
- [ ] **Memory Management**: Implement proper cleanup for large message histories

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/relay.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add comments where necessary

4. **Test your changes**
   - Ensure all existing features still work
   - Test new features thoroughly

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

### Code Style Guidelines

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused
- Handle errors appropriately

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```


---

## 📄 License

This project is licensed under the ISC License.

```
ISC License

Copyright (c) 2026 Rudra Sanandiya

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 👨‍💻 Author

**Rudra Sanandiya** - *The GOAT*

- GitHub: [@rudrasanandiya](https://github.com/rudra1806)

---

## 🙏 Acknowledgments

- **MongoDB** - Database solution
- **Cloudinary** - Image hosting and optimization
- **Resend** - Email delivery service
- **Arcjet** - Security and protection
- **Socket.IO** - Real-time communication
- **React Team** - Amazing UI library
- **Zustand** - Simple state management
- **Vite** - Lightning-fast build tool

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/rudra1806/relay/issues)
3. Open a new issue with detailed information
4. Contact the author

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Built with ❤️ by Rudra Sanandiya**

[Report Bug](https://github.com/rudra1806/relay/issues) · [Request Feature](https://github.com/rudra1806/relay/issues)

</div>
