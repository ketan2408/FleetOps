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
        
        const admins = await Admin.find({});
        const customers = await Customer.find({});
        const vendors = await Vendor.find({});

        console.log('--- DB Audit ---');
        console.log('Admins:', admins.map(a => a.email));
        console.log('Customers:', customers.map(c => c.email));
        console.log('Vendors:', vendors.map(v => v.email));

        const password = 'admin123';

        // Reset all of them just to be safe and thorough
        console.log('\n--- Resetting Passwords to "admin123" ---');
        for (const a of admins) {
            a.password = password;
            await a.save();
            console.log(`Reset Admin: ${a.email}`);
        }
        for (const c of customers) {
            c.password = password;
            await c.save();
            console.log(`Reset Customer: ${c.email}`);
        }
        for (const v of vendors) {
            v.password = password;
            await v.save();
            console.log(`Reset Vendor: ${v.email}`);
        }

        console.log('\nRecovery complete. All users can now login with: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Recovery failed:', error);
        process.exit(1);
    }
};

recovery();
