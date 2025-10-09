import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Badge,
    Container,
    Paper,
    Chip
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSignOutAlt,
    faMoon,
    faSun,
    faCircle,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Swal from 'sweetalert2';

import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import ChatBubble from '../components/ChatBubble';
import InputBar from '../components/InputBar';
import TypingIndicator from '../components/TypingIndicator';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [users, setUsers] = useState([]);
    const { user, logout } = useAuth();
    const {
        socket,
        connected,
        onlineUsers,
        typingUsers,
        sendMessage,
        sendTyping,
        markAsRead
    } = useSocket();
    const { darkMode, toggleDarkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Get other user (the one who is not current user)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/users`);
                setUsers(response.data);

                // Set the other user as the chat partner
                const other = response.data.find(u => u.username !== user.username);
                if (other) {
                    setOtherUser(other);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);

    // Fetch messages when other user is set
    useEffect(() => {
        const fetchMessages = async () => {
            if (otherUser) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/${otherUser.username}`
                    );
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [otherUser]);

    // Socket event listeners
    useEffect(() => {
        if (socket) {
            socket.on('newMessage', (message) => {
                setMessages(prev => [...prev, message]);

                // Mark as read if chat is active
                if (document.hasFocus()) {
                    markAsRead([message._id], message.sender);
                }
            });

            socket.on('messageSent', (message) => {
                setMessages(prev => [...prev, message]);
            });

            socket.on('messagesRead', ({ messageIds }) => {
                setMessages(prev =>
                    prev.map(msg =>
                        messageIds.includes(msg._id)
                            ? { ...msg, read: true }
                            : msg
                    )
                );
            });

            return () => {
                socket.off('newMessage');
                socket.off('messageSent');
                socket.off('messagesRead');
            };
        }
    }, [socket, markAsRead]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when they come into view
    useEffect(() => {
        if (messages.length > 0 && otherUser) {
            const unreadMessages = messages.filter(
                msg => msg.sender === otherUser.username && !msg.read
            );

            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map(msg => msg._id);
                markAsRead(messageIds, otherUser.username);
            }
        }
    }, [messages, otherUser, markAsRead]);

    // Request notification permission and setup push notifications
    useEffect(() => {
        const setupPushNotifications = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const permission = await Notification.requestPermission();

                    if (permission === 'granted') {
                        const registration = await navigator.serviceWorker.ready;

                        // Subscribe to push notifications
                        // Note: Replace with your actual VAPID public key from .env
                        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f53NlckzzxVKyPF_mGSghbNjwnwjLHc8MacDJETHOOOOOOOOOOO';

                        const subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: vapidPublicKey
                        });

                        // Send subscription to server
                        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/subscribe`, {
                            subscription,
                            username: user.username
                        });
                    }
                } catch (error) {
                    console.error('Push notification setup error:', error);
                }
            }
        };

        if (user) {
            setupPushNotifications();
        }
    }, [user]);

    const handleSendMessage = (message) => {
        if (otherUser) {
            sendMessage(otherUser.username, message);
        }
    };

    const handleTyping = (isTyping) => {
        if (otherUser) {
            sendTyping(otherUser.username, isTyping);
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',
            background: darkMode ? '#2a2a2a' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000'
        });

        if (result.isConfirmed) {
            await logout();
        }
    };

    const isOtherUserOnline = otherUser && onlineUsers.has(otherUser.username);
    const isOtherUserTyping = otherUser && typingUsers.has(otherUser.username);

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: darkMode
                        ? 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <Toolbar>
                    <Avatar
                        sx={{
                            mr: 2,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)'
                        }}
                    >
                        {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                            {otherUser?.username || 'Loading...'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FontAwesomeIcon
                                icon={faCircle}
                                style={{
                                    color: isOtherUserOnline ? '#4caf50' : '#757575',
                                    fontSize: '8px'
                                }}
                            />
                            <Typography variant="caption">
                                {isOtherUserOnline ? 'Online' : 'Offline'}
                            </Typography>
                        </Box>
                    </Box>

                    <Badge
                        color="error"
                        variant="dot"
                        invisible={connected}
                    >
                        <IconButton color="inherit">
                            <FontAwesomeIcon icon={faBell} />
                        </IconButton>
                    </Badge>

                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                    </IconButton>

                    <IconButton color="inherit" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Connection Status */}
            {!connected && (
                <Box sx={{ p: 1, bgcolor: 'warning.main', textAlign: 'center' }}>
                    <Typography variant="body2" color="warning.contrastText">
                        Connecting to server...
                    </Typography>
                </Box>
            )}

            {/* Messages Area */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    background: darkMode
                        ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)',
                    backgroundImage: darkMode
                        ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23333" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                        : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ddd" fill-opacity="0.3"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}
            >
                <Container maxWidth="md" sx={{ py: 2, height: '100%' }}>
                    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                        {messages.length === 0 ? (
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                        background: darkMode ? '#2a2a2a' : '#ffffff'
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No messages yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Start a conversation with {otherUser?.username}!
                                    </Typography>
                                </Paper>
                            </Box>
                        ) : (
                            <Box sx={{ flexGrow: 1 }}>
                                {messages.map((message) => (
                                    <ChatBubble
                                        key={message._id}
                                        message={message}
                                        isOwn={message.sender === user.username}
                                    />
                                ))}

                                {isOtherUserTyping && (
                                    <TypingIndicator username={otherUser.username} />
                                )}

                                <div ref={messagesEndRef} />
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Container maxWidth="md">
                    <InputBar
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                    />
                </Container>
            </Box>
        </Box>
    );
};

export default Chat;