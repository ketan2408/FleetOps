const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const renameCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        // 1. Handle Admins: rename 'admins' to 'admin'
        const adminsExists = (await db.listCollections({ name: 'admins' }).toArray()).length > 0;
        if (adminsExists) {
            await db.collection('admins').rename('admin');
            console.log('Renamed admins -> admin');
        }

        // 2. Handle Vendors: rename 'vendors' to 'vendor'
        const vendorsExists = (await db.listCollections({ name: 'vendors' }).toArray()).length > 0;
        if (vendorsExists) {
            await db.collection('vendors').rename('vendor');
            console.log('Renamed vendors -> vendor');
        }

        // 3. Handle Customers: rename 'customers' to 'user'
        // First backup/rename existing 'users' to 'users_old' if it's not our target
        const usersExists = (await db.listCollections({ name: 'users' }).toArray()).length > 0;
        if (usersExists) {
            await db.collection('users').rename('user_legacy');
            console.log('Renamed legacy users -> user_legacy');
        }

        const customersExists = (await db.listCollections({ name: 'customers' }).toArray()).length > 0;
        if (customersExists) {
            await db.collection('customers').rename('user');
            console.log('Renamed customers -> user');
        }

        console.log('Collections renamed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to rename collections:', error);
        process.exit(1);
    }
};

renameCollections();
