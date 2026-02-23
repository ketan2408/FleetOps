const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- ADMINS ---');
        const admins = await Admin.find({}).select('+password');
        admins.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Pwd: ${u.password ? u.password.substring(0, 10) + '...' : 'MISSING'}`));

        console.log('\n--- VENDORS ---');
        const vendors = await Vendor.find({}).select('+password');
        vendors.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Pwd: ${u.password ? u.password.substring(0, 10) + '...' : 'MISSING'}`));

        console.log('\n--- CUSTOMERS ---');
        const customers = await Customer.find({}).select('+password');
        customers.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Pwd: ${u.password ? u.password.substring(0, 10) + '...' : 'MISSING'}`));

        process.exit(0);
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
};

audit();
