const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB.');

        const admin = await Admin.findOne({ email: 'fleetops@gmail.com' });
        const customer = await Customer.findOne({ email: 'ketan@gmail.com' });
        const vendor = await Vendor.findOne({ email: 'pp@gmail.com' });

        console.log('--- DB Audit ---');
        console.log('Admin (fleetops@gmail.com):', admin ? 'EXISTS' : 'MISSING');
        console.log('Customer (ketan@gmail.com):', customer ? 'EXISTS' : 'MISSING');
        console.log('Vendor (pp@gmail.com):', vendor ? 'EXISTS' : 'MISSING');

        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
};

checkDB();
