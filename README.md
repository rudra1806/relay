# Relay - Real-Time Chat Application

<div align="center">

![Relay Logo](frontend/public/relay-icon.svg)

**A modern, secure, and feature-rich real-time messaging platform built with the MERN stack**

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.10.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Real-Time Communication](#-real-time-communication)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview


**Relay** is a production-ready, full-stack real-time chat application that enables users to communicate instantly through text and image messages. Built with modern web technologies, it features a responsive design, robust security measures, and seamless real-time updates powered by WebSocket technology.

### Key Highlights

- **Real-Time Messaging**: Instant message delivery using Socket.IO
- **Rich Media Support**: Send text messages and images with Cloudinary integration
- **Advanced Security**: Multi-layered protection with Arcjet (bot detection, rate limiting, shield)
- **User Presence**: Real-time online/offline status and typing indicators
- **Read Receipts**: Track message delivery and read status
- **Responsive Design**: Mobile-first approach with smooth animations
- **Production Ready**: Optimized for deployment with comprehensive error handling

---

## ✨ Features

### Core Functionality
- ✅ User authentication (signup/login/logout) with JWT
- ✅ Real-time one-on-one messaging
- ✅ Image sharing with automatic optimization
- ✅ Message history and persistence
- ✅ User profile management with avatar upload
- ✅ Contact list with last message preview
- ✅ Unread message counters
- ✅ Read receipts and message status

### Real-Time Features
- 🔴 Online/offline user status
- ⌨️ Typing indicators
- 📨 Instant message delivery
- 🔔 Real-time notifications
- 👥 Active users list

### Security Features
- 🔒 JWT-based authentication
- 🛡️ Arcjet security suite (bot detection, rate limiting, attack prevention)
- 🍪 HTTP-only secure cookies
- 🔐 Password hashing with bcrypt
- 🚫 CSRF protection
- ⚡ Request validation and sanitization


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
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
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
│  │  Express.js Server                                       │  │
│  │  ┌────────────────┐         ┌────────────────────────┐   │  │
│  │  │ Auth Routes    │         │  Message Routes        │   │  │
│  │  │ - /signup      │         │  - /contacts           │   │  │
│  │  │ - /login       │         │  - /chats              │   │  │
│  │  │ - /logout      │         │  - /:id (get messages) │   │  │
│  │  │ - /check       │         │  - /send/:id           │   │  │
│  │  │ - /update      │         │  - /read/:id           │   │  │
│  │  └────────────────┘         └────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Socket.IO Server (WebSocket)                            │  │
│  │  - Connection management                                 │  │
│  │  - Real-time event handling                              │  │
│  │  - Online users tracking                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↕
┌────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   MongoDB    │  │  Cloudinary  │  │      Resend          │  │
│  │   Database   │  │  (Images)    │  │      (Email)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```


### Authentication Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Arcjet
    participant Server
    participant JWT
    participant MongoDB
    participant Resend

    Client->>Server: POST /api/auth/signup
    Server->>Arcjet: Validate request (bot detection, rate limit)
    Arcjet-->>Server: Request allowed
    Server->>Server: Validate input data
    Server->>MongoDB: Check if user exists
    MongoDB-->>Server: User not found
    Server->>Server: Hash password (bcrypt)
    Server->>MongoDB: Create new user
    MongoDB-->>Server: User created
    Server->>JWT: Generate token
    JWT-->>Server: JWT token
    Server->>Server: Set HTTP-only cookie
    Server->>Resend: Send welcome email
    Server-->>Client: 201 Created (user data)
    Client->>Client: Store user in state
    Client->>Server: Connect WebSocket
```

### Message Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant Sender
    participant SenderSocket
    participant Server
    participant MongoDB
    participant Cloudinary
    participant ReceiverSocket
    participant Receiver

    Sender->>Server: POST /api/message/send/:id
    Server->>Server: Validate JWT & user
    alt Image included
        Server->>Cloudinary: Upload image
        Cloudinary-->>Server: Image URL
    end
    Server->>MongoDB: Save message
    MongoDB-->>Server: Message saved
    Server-->>Sender: 201 Created (message)
    Server->>ReceiverSocket: Emit 'newMessage' event
    ReceiverSocket->>Receiver: Display message
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
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

#### 2. Login
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

#### 3. Logout
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

#### 4. Check Authentication
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

#### 5. Update Profile
```http
PUT /api/auth/update-profile
Authorization: Required (JWT Cookie)
Content-Type: application/json

{
  "name": "John Updated",
  "profilePic": "data:image/jpeg;base64,..."
}
```


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


### WebSocket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `typing` | `{ receiverId: string }` | Notify that user is typing |
| `stopTyping` | `{ receiverId: string }` | Notify that user stopped typing |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `getOnlineUsers` | `string[]` | Array of online user IDs |
| `newMessage` | `Message` | New message received |
| `userTyping` | `{ senderId: string }` | User started typing |
| `userStopTyping` | `{ senderId: string }` | User stopped typing |
| `messagesRead` | `{ readBy: string }` | Messages marked as read |

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
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- email: 1 (unique)
```

### Message Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required, indexed),
  receiverId: ObjectId (ref: 'User', required, indexed),
  text: String (max: 5000 chars, trimmed),
  image: String (URL, trimmed),
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
│ createdAt: Date         │
│ updatedAt: Date         │
└─────────────────────────┘
           │
           │ 1
           │
           │ sends/receives
           │
           │ *
           ▼
┌─────────────────────────┐
│       Message           │
├─────────────────────────┤
│ _id: ObjectId (PK)      │
│ senderId: ObjectId (FK) │
│ receiverId: ObjectId(FK)│
│ text: String            │
│ image: String           │
│ isRead: Boolean         │
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
- 100 requests per IP per 60-second window
- Prevents abuse and DDoS attacks

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
│  useSocketStore                                         │
│  - socket, onlineUsers, typingUsers                     │
│  - connectSocket(), disconnectSocket()                  │
│  - emitTyping(), emitStopTyping()                       │
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
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Environment configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Authentication logic
│   │   │   └── message.controller.js  # Message handling logic
│   │   ├── emails/
│   │   │   ├── emailHandlers.js       # Email sending functions
│   │   │   └── emailTemplates.js      # Email HTML templates
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
│   │   │   ├── message.model.js       # Message schema
│   │   │   └── user.model.js          # User schema
│   │   ├── routes/
│   │   │   ├── auth.route.js          # Authentication routes
│   │   │   └── message.route.js       # Message routes
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
│   │   │   ├── chat/
│   │   │   │   ├── ChatHeader.jsx     # Chat header component
│   │   │   │   ├── EmptyChat.jsx      # Empty state component
│   │   │   │   ├── MessageBubble.jsx  # Individual message component
│   │   │   │   ├── MessageInput.jsx   # Message input component
│   │   │   │   └── MessageList.jsx    # Messages list component
│   │   │   ├── layout/                # Layout components
│   │   │   ├── shared/
│   │   │   │   ├── Avatar.jsx         # User avatar component
│   │   │   │   ├── Button.jsx         # Reusable button component
│   │   │   │   ├── ImageLightbox.jsx  # Image preview modal
│   │   │   │   ├── Input.jsx          # Reusable input component
│   │   │   │   └── Logo.jsx           # App logo component
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
│   │   │   ├── useChatStore.js        # Chat state
│   │   │   ├── useSocketStore.js      # WebSocket state
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

### 1. User Authentication

**Signup Flow:**
1. User submits registration form
2. Arcjet validates request (bot detection, rate limiting)
3. Server validates input data
4. Check if email already exists
5. Hash password with bcrypt (10 rounds)
6. Create user in MongoDB
7. Generate JWT token (7-day expiry)
8. Set HTTP-only secure cookie
9. Send welcome email via Resend
10. Return user data to client

**Login Flow:**
1. User submits credentials
2. Arcjet validates request
3. Find user by email
4. Compare password with bcrypt
5. Generate JWT token
6. Set HTTP-only secure cookie
7. Return user data to client

### 2. Real-Time Messaging

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

### 3. Image Handling

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


### 4. Online Status & Presence

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

### 5. Typing Indicators

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

### 6. Unread Message Counters

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
- [ ] Sign up with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Logout functionality
- [ ] Protected routes redirect when not authenticated
- [ ] JWT token persists across page refreshes

**Messaging:**
- [ ] Send text message
- [ ] Send image message
- [ ] Send message with both text and image
- [ ] Receive messages in real-time
- [ ] Messages persist after refresh
- [ ] Message timestamps display correctly
- [ ] Read receipts update correctly

**Real-Time Features:**
- [ ] Online status updates immediately
- [ ] Typing indicators appear and disappear
- [ ] Multiple tabs/devices sync correctly
- [ ] Reconnection after network loss

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

- [ ] **Group Chats**: Create and manage group conversations
- [ ] **Voice Messages**: Record and send audio messages
- [ ] **Video Calls**: One-on-one video calling with WebRTC
- [ ] **File Sharing**: Send documents, PDFs, and other files
- [ ] **Message Reactions**: React to messages with emojis
- [ ] **Message Editing**: Edit sent messages
- [ ] **Message Deletion**: Delete messages for everyone
- [ ] **Search Functionality**: Search messages and contacts
- [ ] **Push Notifications**: Browser and mobile push notifications
- [ ] **Message Forwarding**: Forward messages to other contacts
- [ ] **User Status**: Custom status messages
- [ ] **Last Seen**: Show when user was last active
- [ ] **Blocked Users**: Block and unblock functionality
- [ ] **Message Encryption**: End-to-end encryption
- [ ] **Dark Mode**: Theme customization
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Admin Dashboard**: User management and analytics
- [ ] **Message Scheduling**: Schedule messages for later
- [ ] **Auto-delete Messages**: Temporary messages feature

### Performance Optimizations

- [ ] Implement message pagination
- [ ] Add Redis for caching
- [ ] Optimize database queries with aggregation
- [ ] Implement CDN for static assets
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for images
- [ ] Add compression middleware
- [ ] Optimize bundle size with code splitting

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

- GitHub: [@rudrasanandiya](https://github.com/rudrasanandiya)
- Email: [your-email@example.com](mailto:your-email@example.com)

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
2. Search existing [GitHub Issues](https://github.com/yourusername/relay/issues)
3. Open a new issue with detailed information
4. Contact the author

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Built with ❤️ by Rudra Sanandiya**

[Report Bug](https://github.com/yourusername/relay/issues) · [Request Feature](https://github.com/yourusername/relay/issues)

</div>
