const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for verification...');

        const email = 'fleetops@gmail.com';
        const password = 'admin123';

        const admin = await Admin.findOne({ email }).select('+password');
        
        if (!admin) {
            console.log(`FAIL: Admin with email ${email} NOT found.`);
            const allAdmins = await Admin.find({});
            console.log('Admins found in DB:', allAdmins.map(a => a.email));
            process.exit(1);
        }

        console.log(`SUCCESS: Admin ${email} found.`);
        console.log(`Role: ${admin.role}, isActive: ${admin.isActive}`);
        
        const isValid = await admin.comparePassword(password, admin.password);
        console.log(`Password comparison for 'admin123': ${isValid}`);

        if (!isValid) {
            console.log('Exploring the hash...');
            console.log(`Hash in DB: ${admin.password}`);
            // Check if it's double hashed
            // If we hash 'admin123' once, we get $2b$12$...
            // If we hashed a hash, it would also start with $2b$12$... but be different.
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyLogin();
