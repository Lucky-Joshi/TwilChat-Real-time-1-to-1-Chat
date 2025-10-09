import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map());
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

            newSocket.on('connect', () => {
                console.log('Connected to server');
                setConnected(true);
                newSocket.emit('authenticate', token);
            });

            newSocket.on('authenticated', () => {
                console.log('Socket authenticated');
            });

            newSocket.on('authError', (error) => {
                console.error('Socket auth error:', error);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from server');
                setConnected(false);
            });

            newSocket.on('userOnline', (username) => {
                setOnlineUsers(prev => new Set([...prev, username]));
            });

            newSocket.on('userOffline', (username) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(username);
                    return newSet;
                });
            });

            newSocket.on('userTyping', ({ user: typingUser, isTyping }) => {
                setTypingUsers(prev => {
                    const newMap = new Map(prev);
                    if (isTyping) {
                        newMap.set(typingUser, true);
                    } else {
                        newMap.delete(typingUser);
                    }
                    return newMap;
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
                setConnected(false);
            };
        }
    }, [user, token]);

    const sendMessage = (receiver, message) => {
        if (socket && connected) {
            socket.emit('sendMessage', { receiver, message });
        }
    };

    const sendTyping = (receiver, isTyping) => {
        if (socket && connected) {
            socket.emit('typing', { receiver, isTyping });
        }
    };

    const markAsRead = (messageIds, sender) => {
        if (socket && connected) {
            socket.emit('markAsRead', { messageIds, sender });
        }
    };

    const value = {
        socket,
        connected,
        onlineUsers,
        typingUsers,
        sendMessage,
        sendTyping,
        markAsRead
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};