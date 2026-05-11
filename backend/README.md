# TwilChat Backend

Real-time 1-to-1 chat application backend built with Express.js, Socket.IO, Prisma ORM, and Supabase PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **ORM**: Prisma
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Push Notifications**: Web Push API

## Quick Start

### 1. Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account (free at https://supabase.com)

### 2. Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### 3. Environment Setup

```bash
# Copy example environment file
copy .env.example .env

# Edit .env and add your Supabase connection string
# DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres?schema=public"
```

### 4. Database Setup

```bash
# Run migrations to create tables
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   └── messageController.js
├── middleware/          # Express middleware
│   └── auth.js
├── routes/             # API routes
│   ├── auth.js
│   └── messages.js
├── lib/                # Utilities
│   └── prisma.js       # Prisma client instance
├── prisma/             # Prisma configuration
│   └── schema.prisma   # Database schema
├── server.js           # Main server file
├── package.json
└── .env.example        # Environment variables template
```

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with username and password

**Request:**
```json
{
  "username": "alice",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clh7x9z1a0000...",
    "username": "alice",
    "isOnline": true
  }
}
```

#### POST `/api/auth/logout`
Logout current user (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

### Messages

#### GET `/api/messages/users`
Get list of all users with their online status

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "username": "bob",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00Z"
  }
]
```

#### GET `/api/messages/:otherUser`
Get message history with a specific user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "clh7x9z1a0001...",
    "sender": "alice",
    "receiver": "bob",
    "message": "Hello!",
    "timestamp": "2024-01-15T10:30:00Z",
    "read": true,
    "delivered": true
  }
]
```

#### POST `/api/messages/mark-read`
Mark messages as read

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "messageIds": ["clh7x9z1a0001...", "clh7x9z1a0002..."]
}
```

### Push Notifications

#### POST `/api/subscribe`
Subscribe to push notifications

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "username": "alice"
}
```

## Socket.IO Events

### Client → Server

#### `authenticate`
Authenticate socket connection with JWT token

```javascript
socket.emit('authenticate', token);
```

#### `sendMessage`
Send a message to another user

```javascript
socket.emit('sendMessage', {
  receiver: 'bob',
  message: 'Hello Bob!'
});
```

#### `typing`
Notify that user is typing

```javascript
socket.emit('typing', {
  receiver: 'bob',
  isTyping: true
});
```

#### `markAsRead`
Mark messages as read

```javascript
socket.emit('markAsRead', {
  messageIds: ['msg1', 'msg2'],
  sender: 'bob'
});
```

### Server → Client

#### `authenticated`
Socket successfully authenticated

#### `authError`
Authentication failed

#### `newMessage`
Received a new message

```javascript
{
  id: 'msg1',
  sender: 'bob',
  receiver: 'alice',
  message: 'Hi Alice!',
  timestamp: '2024-01-15T10:30:00Z',
  read: false,
  delivered: true
}
```

#### `messageSent`
Message successfully sent

#### `messageError`
Error sending message

#### `userOnline`
User came online

```javascript
'bob'
```

#### `userOffline`
User went offline

```javascript
'bob'
```

#### `userTyping`
User is typing

```javascript
{
  user: 'bob',
  isTyping: true
}
```

#### `messagesRead`
Messages were read by recipient

```javascript
{
  messageIds: ['msg1', 'msg2'],
  reader: 'bob'
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `USER1_NAME` | First demo user username | `alice` |
| `USER1_PASS` | First demo user password | `password123` |
| `USER2_NAME` | Second demo user username | `bob` |
| `USER2_PASS` | Second demo user password | `password456` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `VAPID_PUBLIC_KEY` | Web push public key (optional) | `...` |
| `VAPID_PRIVATE_KEY` | Web push private key (optional) | `...` |
| `VAPID_SUBJECT` | Web push subject (optional) | `mailto:...` |

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
  id String @id @default(cuid())
  username String @unique
  password String
  isOnline Boolean @default(false)
  lastSeen DateTime @default(now())
  pushSubscription Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
)
```

### Message Table
```sql
CREATE TABLE "Message" (
  id String @id @default(cuid())
  sender String
  receiver String
  message String
  timestamp DateTime @default(now())
  read Boolean @default(false)
  delivered Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
)
```

## Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Development

### Adding a New Database Field

1. Update `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Give the migration a name when prompted

### Debugging

Enable detailed logging by setting `NODE_ENV=development` in `.env`

### Testing Socket.IO Events

Use a Socket.IO client library or test tool:
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Postman](https://www.postman.com/) with Socket.IO support

## Deployment

### Heroku

```bash
# Add buildpack for Node.js
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set DATABASE_URL="..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Vercel (with serverless functions)

Not recommended for Socket.IO due to connection limitations. Use traditional hosting instead.

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure IP is whitelisted (Supabase allows all by default)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Prisma Client Not Found
```bash
npm install
npm run prisma:generate
```

## Performance Tips

1. **Database Indexing**: Already configured on `username`, `sender`, `receiver`, `timestamp`
2. **Connection Pooling**: Supabase handles this automatically
3. **Message Pagination**: Implement in frontend to load messages in batches
4. **Socket.IO Rooms**: Consider using rooms for better scalability

## Security Considerations

1. ✅ JWT tokens expire after 24 hours
2. ✅ Passwords are hashed with bcryptjs
3. ✅ CORS is configured for frontend URL only
4. ✅ Environment variables are not committed to git
5. ⚠️ TODO: Add rate limiting for API endpoints
6. ⚠️ TODO: Add input validation and sanitization
7. ⚠️ TODO: Enable HTTPS in production

## License

MIT

## Support

For issues or questions, please check:
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
