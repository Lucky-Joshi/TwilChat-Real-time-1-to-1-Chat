import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Popover
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';
import { useTheme } from '../context/ThemeContext';

const InputBar = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { darkMode } = useTheme();
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiButtonRef = useRef(null);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            handleStopTyping();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            onTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 1000);
    };

    const handleStopTyping = () => {
        if (isTyping) {
            setIsTyping(false);
            onTyping(false);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                borderRadius: '24px',
                background: darkMode
                    ? 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <IconButton
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{
                        color: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FontAwesomeIcon icon={faSmile} />
                </IconButton>

                <TextField
                    ref={inputRef}
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                            '& fieldset': {
                                borderColor: 'transparent'
                            },
                            '&:hover fieldset': {
                                borderColor: 'primary.main'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main'
                            }
                        }
                    }}
                />

                <IconButton
                    onClick={handleSend}
                    disabled={!message.trim()}
                    sx={{
                        background: message.trim()
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'grey.300',
                        color: 'white',
                        '&:hover': {
                            background: message.trim()
                                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                                : 'grey.400',
                            transform: 'scale(1.1)'
                        },
                        '&:disabled': {
                            color: 'grey.500'
                        },
                        transition: 'all 0.2s ease',
                        animation: message.trim() ? 'pulse 1s ease-in-out infinite' : 'none'
                    }}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </IconButton>
            </Box>

            <Popover
                open={showEmojiPicker}
                anchorEl={emojiButtonRef.current}
                onClose={() => setShowEmojiPicker(false)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={darkMode ? 'dark' : 'light'}
                    height={400}
                    width={350}
                />
            </Popover>
        </Paper>
    );
};

export default InputBar;