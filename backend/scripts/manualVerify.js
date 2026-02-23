const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const password = 'admin123';

        console.log('Manual Verification of "admin123":');

        const a = await Admin.findOne({ email: 'fleetops@gmail.com' }).select('+password');
        if (a) {
            const match = await bcrypt.compare(password, a.password);
            console.log(`Admin (fleetops@gmail.com): Match=${match}, Hash=${a.password}`);
        }

        const v = await Vendor.findOne({ email: 'pp@gmail.com' }).select('+password');
        if (v) {
            const match = await bcrypt.compare(password, v.password);
            console.log(`Vendor (pp@gmail.com): Match=${match}, Hash=${v.password}`);
        }

        const c = await Customer.findOne({ email: 'ketan@gmail.com' }).select('+password');
        if (c) {
            const match = await bcrypt.compare(password, c.password);
            console.log(`Customer (ketan@gmail.com): Match=${match}, Hash=${c.password}`);
        }

        const c2 = await Customer.findOne({ email: 'kp905053@gmail.com' }).select('+password');
        if (c2) {
            const match = await bcrypt.compare(password, c2.password);
            console.log(`Customer (kp905053@gmail.com): Match=${match}, Hash=${c2.password}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verify failed:', error);
        process.exit(1);
    }
};

verify();
