const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const listCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Current Collections:');
        collections.forEach(c => console.log(`- ${c.name}`));
        process.exit(0);
    } catch (error) {
        console.error('Failed to list collections:', error);
        process.exit(1);
    }
};

listCollections();
