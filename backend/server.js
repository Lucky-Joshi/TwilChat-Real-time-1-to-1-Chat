require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Configure VAPID keys for push notifications
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Push notification subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { subscription, username } = req.body;

        const user = await User.findOne({ username });
        if (user) {
            user.pushSubscription = subscription;
            await user.save();
        }

        res.json({ message: 'Subscription saved' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username;

            connectedUsers.set(decoded.username, socket.id);

            // Update user online status
            await User.findByIdAndUpdate(decoded.userId, {
                isOnline: true,
                lastSeen: new Date()
            });

            // Notify other users about online status
            socket.broadcast.emit('userOnline', decoded.username);

            socket.emit('authenticated');
        } catch (error) {
            socket.emit('authError', 'Invalid token');
        }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
        try {
            const { receiver, message } = data;

            // Save message to database
            const newMessage = new Message({
                sender: socket.username,
                receiver,
                message,
                delivered: connectedUsers.has(receiver)
            });

            await newMessage.save();

            // Send to receiver if online
            const receiverSocketId = connectedUsers.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', {
                    _id: newMessage._id,
                    sender: socket.username,
                    receiver,
                    message,
                    timestamp: newMessage.timestamp,
                    read: false,
                    delivered: true
                });

                // Update delivered status
                newMessage.delivered = true;
                await newMessage.save();
            } else {
                // Send push notification if user is offline
                const receiverUser = await User.findOne({ username: receiver });
                if (receiverUser && receiverUser.pushSubscription) {
                    const payload = JSON.stringify({
                        title: `New message from ${socket.username}`,
                        body: message,
                        icon: '/icon-192x192.png',
                        badge: '/badge-72x72.png'
                    });

                    try {
                        await webpush.sendNotification(receiverUser.pushSubscription, payload);
                    } catch (error) {
                        console.error('Push notification error:', error);
                    }
                }
            }

            // Confirm to sender
            socket.emit('messageSent', {
                _id: newMessage._id,
                sender: socket.username,
                receiver,
                message,
                timestamp: newMessage.timestamp,
                read: false,
                delivered: newMessage.delivered
            });

        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('messageError', 'Failed to send message');
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const { receiver, isTyping } = data;
        const receiverSocketId = connectedUsers.get(receiver);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userTyping', {
                user: socket.username,
                isTyping
            });
        }
    });

    // Handle message read receipts
    socket.on('markAsRead', async (data) => {
        try {
            const { messageIds, sender } = data;

            await Message.updateMany(
                {
                    _id: { $in: messageIds },
                    receiver: socket.username,
                    read: false
                },
                { read: true }
            );

            // Notify sender about read receipts
            const senderSocketId = connectedUsers.get(sender);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesRead', {
                    messageIds,
                    reader: socket.username
                });
            }

        } catch (error) {
            console.error('Mark as read error:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);

        if (socket.username) {
            connectedUsers.delete(socket.username);

            // Update user offline status
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });
            }

            // Notify other users about offline status
            socket.broadcast.emit('userOffline', socket.username);
        }
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});