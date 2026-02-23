const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const listEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const admins = await Admin.find({}, 'email');
        const customers = await Customer.find({}, 'email');
        const vendors = await Vendor.find({}, 'email');

        console.log('Admins:', admins.map(a => a.email));
        console.log('Customers:', customers.map(c => c.email));
        console.log('Vendors:', vendors.map(v => v.email));

        process.exit(0);
    } catch (error) {
        console.error('Failed to list emails:', error);
        process.exit(1);
    }
};

listEmails();
