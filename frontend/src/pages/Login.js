import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Avatar
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/chat');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please enter both username and password',
                background: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000'
            });
            return;
        }

        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Welcome!',
                text: 'Login successful',
                timer: 1500,
                showConfirmButton: false,
                background: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000'
            });
            navigate('/chat');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: result.message,
                background: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000'
            });
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: darkMode
                    ? 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: '24px',
                        background: darkMode
                            ? 'rgba(42, 42, 42, 0.9)'
                            : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        animation: 'fadeIn 0.8s ease-out'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                margin: '0 auto 16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                animation: 'bounce 1s ease-out'
                            }}
                        >
                            <FontAwesomeIcon icon={faComments} size="2x" color="white" />
                        </Avatar>

                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            TwilChat
                        </Typography>

                        <Typography variant="h6" color="text.secondary">
                            Real-time 1-to-1 Chat
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>

                </Paper>
            </Container>
        </Box>
    );
};

export default Login;