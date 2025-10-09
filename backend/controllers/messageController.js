const Message = require('../models/Message');
const User = require('../models/User');

const getMessages = async (req, res) => {
    try {
        const { otherUser } = req.params;
        const currentUser = req.username;

        const messages = await Message.find({
            $or: [
                { sender: currentUser, receiver: otherUser },
                { sender: otherUser, receiver: currentUser }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const currentUser = req.username;

        await Message.updateMany(
            {
                _id: { $in: messageIds },
                receiver: currentUser,
                read: false
            },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const currentUser = req.username;
        const users = await User.find({ username: { $ne: currentUser } })
            .select('username isOnline lastSeen');

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMessages, markAsRead, getUsers };