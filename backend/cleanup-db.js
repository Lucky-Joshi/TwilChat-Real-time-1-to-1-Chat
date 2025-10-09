require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Dropping twilchat database...');
        await mongoose.connection.db.dropDatabase();

        console.log('Database cleaned up successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up database:', error);
        process.exit(1);
    }
}

cleanupDatabase();