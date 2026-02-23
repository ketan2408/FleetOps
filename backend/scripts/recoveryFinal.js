const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const recovery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const password = 'admin123';

        // 1. Admin
        let admin = await Admin.findOne({ email: 'fleetops@gmail.com' });
        if (!admin) {
            admin = await Admin.create({
                name: 'System Admin',
                email: 'fleetops@gmail.com',
                password,
                role: 'ADMIN',
                isActive: true
            });
            console.log('Admin created.');
        } else {
            admin.password = password;
            await admin.save();
            console.log('Admin reset.');
        }

        // 2. Vendor
        let vendor = await Vendor.findOne({ email: 'pp@gmail.com' });
        if (!vendor) {
            vendor = await Vendor.create({
                name: 'Test Vendor',
                email: 'pp@gmail.com',
                password,
                role: 'VENDOR',
                isActive: true,
                companyName: 'FleetOps Vendor'
            });
            console.log('Vendor created.');
        } else {
            vendor.password = password;
            await vendor.save();
            console.log('Vendor reset.');
        }

        // 3. Customer
        let customer = await Customer.findOne({ email: 'ketan@gmail.com' });
        if (!customer) {
            customer = await Customer.create({
                name: 'Ketan Patil',
                email: 'ketan@gmail.com',
                password,
                role: 'USER',
                isActive: true
            });
            console.log('Customer created.');
        } else {
            customer.password = password;
            await customer.save();
            console.log('Customer reset.');
        }

        console.log('Recovery complete. All roles: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Recovery failed:', error);
        process.exit(1);
    }
};

recovery();
