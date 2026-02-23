const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dropLegacy = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const legacyExists = (await db.listCollections({ name: 'user_legacy' }).toArray()).length > 0;
        if (legacyExists) {
            await db.collection('user_legacy').drop();
            console.log('Successfully dropped user_legacy collection.');
        } else {
            console.log('user_legacy collection does not exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Failed to drop collection:', error);
        process.exit(1);
    }
};

dropLegacy();
