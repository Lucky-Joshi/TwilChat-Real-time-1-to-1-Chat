# TwilChat Architecture - Prisma + Supabase

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    http://localhost:3000                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Components:                                             │   │
│  │  - Chat.js (Main chat interface)                         │   │
│  │  - Login.js (Authentication)                            │   │
│  │  - ChatBubble.js (Message display)                      │   │
│  │  - InputBar.js (Message input)                          │   │
│  │  - TypingIndicator.js (Typing status)                   │   │
│  │                                                          │   │
│  │  Context:                                               │   │
│  │  - AuthContext (User authentication)                    │   │
│  │  - SocketContext (Real-time connection)                 │   │
│  │  - ThemeContext (UI theme)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                          │
│                    http://localhost:5000                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                 │   │
│  │  - POST /api/auth/login                                 │   │
│  │  - POST /api/auth/logout                                │   │
│  │  - GET /api/messages/users                              │   │
│  │  - GET /api/messages/:otherUser                         │   │
│  │  - POST /api/messages/mark-read                         │   │
│  │  - POST /api/subscribe (push notifications)             │   │
│  │                                                          │   │
│  │  Socket.IO Events:                                      │   │
│  │  - authenticate, sendMessage, typing                    │   │
│  │  - markAsRead, disconnect                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Controllers:                                            │   │
│  │  - authController (Login/Logout)                        │   │
│  │  - messageController (Messages/Users)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware:                                             │   │
│  │  - auth.js (JWT verification)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - prisma.user.findUnique()                              │   │
│  │  - prisma.user.create()                                  │   │
│  │  - prisma.user.update()                                  │   │
│  │  - prisma.message.findMany()                             │   │
│  │  - prisma.message.create()                               │   │
│  │  - prisma.message.updateMany()                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              │
┌─────────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ User                                               │  │   │
│  │  │ - id (CUID)                                        │  │   │
│  │  │ - username (String, Unique)                        │  │   │
│  │  │ - password (String)                                │  │   │
│  │  │ - isOnline (Boolean)                               │  │   │
│  │  │ - lastSeen (DateTime)                              │  │   │
│  │  │ - pushSubscription (JSON)                          │  │   │
│  │  │ - createdAt, updatedAt (DateTime)                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Message                                            │  │   │
│  │  │ - id (CUID)                                        │  │   │
│  │  │ - sender (String, FK → User.username)             │  │   │
│  │  │ - receiver (String, FK → User.username)           │  │   │
│  │  │ - message (String)                                 │  │   │
│  │  │ - timestamp (DateTime)                             │  │   │
│  │  │ - read (Boolean)                                   │  │   │
│  │  │ - delivered (Boolean)                              │  │   │
│  │  │ - createdAt, updatedAt (DateTime)                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  Indexes:                                               │   │
│  │  - User.username (for fast lookups)                     │   │
│  │  - Message.sender (for query optimization)             │   │
│  │  - Message.receiver (for query optimization)           │   │
│  │  - Message.timestamp (for sorting)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Login Flow
```
Frontend                Backend              Database
   │                       │                    │
   ├─ POST /login ────────>│                    │
   │  (username, password) │                    │
   │                       ├─ Validate creds ──>│
   │                       │                    │
   │                       │<─ User data ───────┤
   │                       │                    │
   │                       ├─ Hash password     │
   │                       ├─ Create/Update user
   │                       │                    │
   │                       ├─ Generate JWT ─────┤
   │                       │                    │
   │<─ Token + User ───────┤                    │
   │                       │                    │
   ├─ Store token          │                    │
   ├─ Connect Socket ──────>│                    │
   │  (with token)         │                    │
   │                       ├─ Verify JWT        │
   │                       ├─ Update online ───>│
   │                       │                    │
   │<─ Authenticated ──────┤                    │
```

### Message Send Flow
```
Sender                Backend              Database           Receiver
  │                     │                    │                  │
  ├─ Send message ─────>│                    │                  │
  │  (receiver, text)   │                    │                  │
  │                     ├─ Save message ────>│                  │
  │                     │                    │                  │
  │                     │<─ Message saved ───┤                  │
  │                     │                    │                  │
  │                     ├─ Check if online ──┤                  │
  │                     │                    │                  │
  │                     ├─ If online: ──────────────────────────>│
  │                     │   Emit newMessage  │                  │
  │                     │                    │                  │
  │                     │<─ Message received ────────────────────┤
  │                     │                    │                  │
  │<─ messageSent ──────┤                    │                  │
  │  (delivered: true)  │                    │                  │
  │                     │                    │                  │
  │                     │ If offline:        │                  │
  │                     ├─ Send push notif ─────────────────────>│
  │                     │                    │                  │
```

### Message Read Flow
```
Receiver              Backend              Database            Sender
  │                     │                    │                  │
  ├─ Mark as read ─────>│                    │                  │
  │  (messageIds)       │                    │                  │
  │                     ├─ Update read ─────>│                  │
  │                     │                    │                  │
  │                     │<─ Updated ─────────┤                  │
  │                     │                    │                  │
  │                     ├─ Emit messagesRead ────────────────────>│
  │                     │                    │                  │
  │<─ Confirmed ────────┤                    │                  │
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      App.js                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Providers:                                           │   │
│  │ - AuthContext                                        │   │
│  │ - SocketContext                                      │   │
│  │ - ThemeContext                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌──────────┐
   │ Login   │      │ Chat    │      │Protected │
   │ Page    │      │ Page    │      │ Route    │
   └─────────┘      └─────────┘      └──────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌──────────┐    ┌────────────┐    ┌──────────┐
   │ChatBubble│    │ InputBar   │    │ Typing   │
   │Component │    │ Component  │    │Indicator │
   └──────────┘    └────────────┘    └──────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  JWT Authentication                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User submits credentials                           │
│     ↓                                                   │
│  2. Backend validates against predefined users         │
│     ↓                                                   │
│  3. Backend generates JWT token                        │
│     Payload: { userId, username, expiresIn: 24h }     │
│     ↓                                                   │
│  4. Frontend stores token in localStorage              │
│     ↓                                                   │
│  5. Frontend includes token in all requests            │
│     Header: Authorization: Bearer <token>              │
│     ↓                                                   │
│  6. Backend verifies token with JWT_SECRET             │
│     ↓                                                   │
│  7. If valid: Request proceeds                         │
│     If invalid: Return 403 Forbidden                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Real-time Communication (Socket.IO)

```
┌─────────────────────────────────────────────────────────┐
│              Socket.IO Connection Flow                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Frontend connects to backend                        │
│     ↓                                                   │
│  2. Frontend emits 'authenticate' with JWT token       │
│     ↓                                                   │
│  3. Backend verifies token                             │
│     ↓                                                   │
│  4. Backend stores user in connectedUsers map          │
│     ↓                                                   │
│  5. Backend broadcasts 'userOnline' event              │
│     ↓                                                   │
│  6. Frontend receives 'authenticated' event            │
│     ↓                                                   │
│  7. Connection ready for real-time events              │
│                                                         │
│  Events:                                               │
│  - sendMessage: Send message to another user           │
│  - typing: Notify user is typing                       │
│  - markAsRead: Mark messages as read                   │
│  - disconnect: User disconnected                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Database Query Patterns

### User Queries
```javascript
// Find user by username
prisma.user.findUnique({ where: { username: "alice" } })

// Create new user
prisma.user.create({
  data: { username: "alice", password: "hashed_password" }
})

// Update user status
prisma.user.update({
  where: { id: userId },
  data: { isOnline: true, lastSeen: new Date() }
})

// Get all users except current
prisma.user.findMany({
  where: { username: { not: currentUser } },
  select: { username: true, isOnline: true, lastSeen: true }
})
```

### Message Queries
```javascript
// Get conversation between two users
prisma.message.findMany({
  where: {
    OR: [
      { sender: "alice", receiver: "bob" },
      { sender: "bob", receiver: "alice" }
    ]
  },
  orderBy: { timestamp: 'asc' }
})

// Create message
prisma.message.create({
  data: {
    sender: "alice",
    receiver: "bob",
    message: "Hello!",
    delivered: true
  }
})

// Mark messages as read
prisma.message.updateMany({
  where: {
    id: { in: messageIds },
    receiver: "bob",
    read: false
  },
  data: { read: true }
})
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Error Handling                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend Error                                         │
│  ├─ Network Error                                       │
│  │  └─ Show "Connection failed" message                │
│  ├─ Auth Error                                          │
│  │  └─ Redirect to login                               │
│  ├─ Validation Error                                    │
│  │  └─ Show error message to user                      │
│  └─ Server Error                                        │
│     └─ Show "Server error" message                     │
│                                                         │
│  Backend Error                                          │
│  ├─ Database Error                                      │
│  │  └─ Log error, return 500                           │
│  ├─ Auth Error                                          │
│  │  └─ Return 401/403                                  │
│  ├─ Validation Error                                    │
│  │  └─ Return 400                                      │
│  └─ Socket Error                                        │
│     └─ Emit error event to client                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Production Setup                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (Vercel/Netlify)                       │   │
│  │  - Static React app                              │   │
│  │  - CDN distribution                              │   │
│  │  - Auto-scaling                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                      │                                   │
│                      │ HTTPS                             │
│                      │                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Backend (Heroku/Railway)                        │   │
│  │  - Node.js server                                │   │
│  │  - Socket.IO for real-time                       │   │
│  │  - Auto-scaling                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                      │                                   │
│                      │ PostgreSQL Protocol               │
│                      │                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Database (Supabase)                             │   │
│  │  - PostgreSQL                                    │   │
│  │  - Automatic backups                             │   │
│  │  - Point-in-time recovery                        │   │
│  │  - Row-level security                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│              Performance Strategies                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Database:                                              │
│  ✓ Indexes on frequently queried fields                │
│  ✓ Connection pooling (Supabase)                       │
│  ✓ Query optimization with Prisma                      │
│                                                         │
│  Backend:                                               │
│  ✓ Prisma client singleton (connection reuse)          │
│  ✓ Socket.IO rooms for scalability                     │
│  ✓ Efficient message broadcasting                      │
│                                                         │
│  Frontend:                                              │
│  ✓ React Context for state management                  │
│  ✓ Lazy loading of messages                            │
│  ✓ Optimized re-renders                                │
│                                                         │
│  Network:                                               │
│  ✓ WebSocket for real-time (Socket.IO)                 │
│  ✓ HTTP/2 for API calls                                │
│  ✓ Gzip compression                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Security Layers                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Transport Security                           │
│  ├─ HTTPS for all API calls                            │
│  ├─ WSS for WebSocket (Socket.IO)                      │
│  └─ TLS 1.2+ encryption                                │
│                                                         │
│  Layer 2: Authentication                               │
│  ├─ JWT tokens with 24h expiration                     │
│  ├─ Token stored in localStorage                       │
│  ├─ Token verified on every request                    │
│  └─ Refresh token mechanism (optional)                 │
│                                                         │
│  Layer 3: Authorization                                │
│  ├─ User can only access own messages                  │
│  ├─ User can only send to existing users               │
│  ├─ Row-level security in database                     │
│  └─ Socket.IO authentication                           │
│                                                         │
│  Layer 4: Data Protection                              │
│  ├─ Passwords hashed with bcryptjs                     │
│  ├─ Sensitive data not logged                          │
│  ├─ SQL injection prevention (Prisma)                  │
│  └─ XSS prevention (React escaping)                    │
│                                                         │
│  Layer 5: Infrastructure                               │
│  ├─ Supabase security features                         │
│  ├─ Automatic backups                                  │
│  ├─ DDoS protection                                    │
│  └─ Monitoring and alerts                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, secure, and maintainable foundation for the TwilChat application.
