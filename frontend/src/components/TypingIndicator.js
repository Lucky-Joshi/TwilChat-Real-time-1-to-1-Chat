import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const TypingIndicator = ({ username }) => {
    const { darkMode } = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 1,
                animation: 'fadeIn 0.3s ease-out'
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 1.5,
                    borderRadius: '18px 18px 18px 4px',
                    background: darkMode ? '#2a2a2a' : '#e3f2fd',
                    minWidth: '80px'
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {username} is typing...
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        gap: '4px',
                        justifyContent: 'center'
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                animation: 'typing 1.4s ease-in-out infinite',
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default TypingIndicator;