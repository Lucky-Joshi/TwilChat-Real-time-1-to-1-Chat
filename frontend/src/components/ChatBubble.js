import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const ChatBubble = ({ message, isOwn, showTimestamp = true }) => {
    const { darkMode } = useTheme();

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTickIcon = () => {
        if (!isOwn) return null;

        if (message.read) {
            return (
                <FontAwesomeIcon
                    icon={faCheckDouble}
                    style={{
                        color: '#4fc3f7',
                        fontSize: '12px',
                        marginLeft: '4px'
                    }}
                />
            );
        } else if (message.delivered) {
            return (
                <FontAwesomeIcon
                    icon={faCheckDouble}
                    style={{
                        color: '#666',
                        fontSize: '12px',
                        marginLeft: '4px'
                    }}
                />
            );
        } else {
            return (
                <FontAwesomeIcon
                    icon={faCheck}
                    style={{
                        color: '#666',
                        fontSize: '12px',
                        marginLeft: '4px'
                    }}
                />
            );
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 1,
                animation: 'fadeIn 0.3s ease-out'
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    maxWidth: '70%',
                    minWidth: '100px',
                    p: 1.5,
                    borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isOwn
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : darkMode
                            ? '#2a2a2a'
                            : '#e3f2fd',
                    color: isOwn ? '#fff' : 'inherit',
                    position: 'relative',
                    wordBreak: 'break-word'
                }}
            >
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {message.message}
                </Typography>

                {showTimestamp && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 0.5
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.7,
                                fontSize: '11px',
                                color: isOwn ? '#fff' : 'text.secondary'
                            }}
                        >
                            {formatTime(message.timestamp)}
                        </Typography>
                        {getTickIcon()}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ChatBubble;