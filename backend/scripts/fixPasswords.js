const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB to fix passwords...');

        // 1. Fix Admin (fleetops@gmail.com)
        const admin = await Admin.findOne({ email: 'fleetops@gmail.com' });
        if (admin) {
            admin.password = 'admin123';
            await admin.save();
            console.log('Fixed Admin password for: fleetops@gmail.com');
        } else {
            // If admin doesn't exist, create it
            await Admin.create({
                name: 'System Admin',
                email: 'fleetops@gmail.com',
                password: 'admin123',
                role: 'ADMIN'
            });
            console.log('Created and Fixed Admin: fleetops@gmail.com');
        }

        // 2. Fix other known accounts if they were corrupted
        // Since we don't know the user's password, we'll reset them to a temp one or ask them to re-register.
        // For now, let's at least ensure the main account works.
        
        console.log('Fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
};

fixPasswords();
