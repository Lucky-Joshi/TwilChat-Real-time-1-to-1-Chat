const express = require('express');
const { getMessages, markAsRead, getUsers } = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/users', authenticateToken, getUsers);
router.get('/:otherUser', authenticateToken, getMessages);
router.post('/mark-read', authenticateToken, markAsRead);

module.exports = router;