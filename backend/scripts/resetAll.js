const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resetAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB to reset accounts...');

        // 1. Reset Admin
        const admin = await Admin.findOne({ email: 'fleetops@gmail.com' });
        if (admin) {
            admin.password = 'admin123';
            await admin.save();
            console.log('Admin (fleetops@gmail.com) -> admin123');
        }

        // 2. Reset Vendor
        const vendor = await Vendor.findOne({ email: 'pp@gmail.com' });
        if (vendor) {
            vendor.password = 'admin123'; // Using same for convenience
            await vendor.save();
            console.log('Vendor (pp@gmail.com) -> admin123');
        }

        // 3. Reset Customer
        const customer = await Customer.findOne({ email: 'ketan@gmail.com' });
        if (customer) {
            customer.password = 'admin123';
            await customer.save();
            console.log('Customer (ketan@gmail.com) -> admin123');
        }

        console.log('All primary test accounts reset to admin123');
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetAll();
