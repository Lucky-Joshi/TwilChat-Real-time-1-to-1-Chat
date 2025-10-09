import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeContextProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
    const { darkMode } = useTheme();

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#667eea',
            },
            secondary: {
                main: '#764ba2',
            },
            background: {
                default: darkMode ? '#121212' : '#f5f5f5',
                paper: darkMode ? '#1e1e1e' : '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
            borderRadius: 12,
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <SocketProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <Chat />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Navigate to="/chat" replace />} />
                        </Routes>
                    </Router>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function App() {
    return (
        <ThemeContextProvider>
            <AppContent />
        </ThemeContextProvider>
    );
}

export default App;