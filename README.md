# TwilChat - Real-time 1-to-1 Chat Application

A full-stack MERN real-time chat application with JWT authentication, Socket.IO integration, push notifications, and a modern UI.

## Features

### Authentication

- Two predefined users only (configured in .env)
- JWT-based authentication
- Secure login/logout

### Chat Features

- Real-time 1-to-1 messaging
- Persistent chat history stored in MongoDB
- Message status indicators:
  - ✔ Sent (single tick)
  - ✔✔ Delivered (double tick, gray)
  - ✔✔ Read (double tick, blue)
- Typing indicators with CSS3 animations
- Online/offline status

### Push Notifications

- Web Push API integration
- Service Worker for background notifications
- VAPID keys for secure push messaging
- Notifications sent when recipient is offline

### UI/UX

- Modern React + Material-UI design
- CSS3 animations and transitions
- Dark/Light mode toggle
- Emoji picker integration
- Responsive chat bubbles
- FontAwesome icons
- SweetAlert2 for elegant alerts
- Gradient themes and glassmorphism effects

## Tech Stack

### Frontend

- React 18
- Material-UI (MUI)
- Socket.IO Client
- FontAwesome Icons
- SweetAlert2
- Emoji Picker React
- Axios

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Web Push (VAPID)
- bcryptjs for password hashing

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Backend
cd TwilChat/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

Edit `backend/.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/twilchat
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# User Credentials
USER1_NAME=User1
USER1_PASS=user1@123
USER2_NAME=User2
USER2_PASS=user2@123

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:admin@twilchat.com
```

### 3. Generate VAPID Keys

```bash
cd backend
npx web-push generate-vapid-keys
```

Copy the generated keys to your `.env` file.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

### 5. Run the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in a new terminal)
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. **Login**: Use one of the predefined credentials:

   - Username: `Ajeet`, Password: `ajeet123`
   - Username: `Shubhika`, Password: `shubhika123`

2. **Chat**: Start messaging with the other user in real-time

3. **Features**:
   - Toggle dark/light mode using the theme button
   - Use emoji picker for expressive messages
   - See typing indicators when the other user is typing
   - View message status with tick indicators
   - Receive push notifications when offline

## Project Structure

```
TwilChat/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── messages.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── sw.js
    ├── src/
    │   ├── components/
    │   │   ├── ChatBubble.js
    │   │   ├── InputBar.js
    │   │   ├── ProtectedRoute.js
    │   │   └── TypingIndicator.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   ├── SocketContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── Chat.js
    │   │   └── Login.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Messages

- `GET /api/messages/users` - Get all users
- `GET /api/messages/:otherUser` - Get messages with specific user
- `POST /api/messages/mark-read` - Mark messages as read

### Push Notifications

- `POST /api/subscribe` - Subscribe to push notifications

## Socket.IO Events

### Client to Server

- `authenticate` - Authenticate socket connection
- `sendMessage` - Send a new message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read

### Server to Client

- `newMessage` - Receive new message
- `messageSent` - Confirm message sent
- `messagesRead` - Messages marked as read
- `userOnline` - User came online
- `userOffline` - User went offline
- `userTyping` - User typing indicator

## Stretch Goals (Future Enhancements)

- [ ] Message deletion
- [ ] File/image sharing
- [ ] Custom chat wallpapers
- [ ] Message search
- [ ] Chat backup/export
- [ ] Multiple chat rooms
- [ ] Voice messages
- [ ] Video calling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
