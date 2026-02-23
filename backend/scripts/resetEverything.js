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
        console.log('Connected to MongoDB.');

        const password = 'admin123';

        const admins = await Admin.find({});
        for (const a of admins) {
            a.password = password;
            await a.save();
            console.log(`Reset Admin: ${a.email}`);
        }

        const vendors = await Vendor.find({});
        for (const v of vendors) {
            v.password = password;
            await v.save();
            console.log(`Reset Vendor: ${v.email}`);
        }

        const customers = await Customer.find({});
        for (const c of customers) {
            c.password = password;
            await c.save();
            console.log(`Reset Customer: ${c.email}`);
        }

        console.log('--- RESET COMPLETE ---');
        console.log('All accounts in DB now use password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetAll();
