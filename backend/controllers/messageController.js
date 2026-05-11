const prisma = require('../lib/prisma');

const getMessages = async (req, res) => {
    try {
        const { otherUser } = req.params;
        const currentUser = req.username;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender: currentUser, receiver: otherUser },
                    { sender: otherUser, receiver: currentUser }
                ]
            },
            orderBy: { timestamp: 'asc' }
        });

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

        await prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                receiver: currentUser,
                read: false
            },
            data: { read: true }
        });

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const currentUser = req.username;
        const users = await prisma.user.findMany({
            where: { username: { not: currentUser } },
            select: {
                username: true,
                isOnline: true,
                lastSeen: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMessages, markAsRead, getUsers };