const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user is one of the predefined users
        const validUsers = {
            [process.env.USER1_NAME]: process.env.USER1_PASS,
            [process.env.USER2_NAME]: process.env.USER2_PASS
        };

        if (!validUsers[username] || validUsers[username] !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Find or create user in database
        let user = await User.findOne({ username });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ username, password: hashedPassword });
            await user.save();
        }

        // Update user status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                isOnline: user.isOnline
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, logout };