const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'fleetops@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log('Admin user not found. Creating now...');
            const admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'ADMIN',
                isActive: true
            });
            console.log('Admin user created successfully:', admin.email);
        } else {
            console.log('Admin user already exists.');
            // Optional: Reset password if exists but login fails
            adminExists.password = 'admin123';
            await adminExists.save();
            console.log('Admin password reset to admin123');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAdmin();
