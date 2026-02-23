const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const password = 'admin123';

        const tests = [
            { model: Admin, email: 'fleetops@gmail.com', name: 'Admin' },
            { model: Vendor, email: 'pp@gmail.com', name: 'Vendor' },
            { model: Customer, email: 'ketan@gmail.com', name: 'Customer' }
        ];

        for (const test of tests) {
            const user = await test.model.findOne({ email: test.email }).select('+password');
            if (!user) {
                console.log(`FAIL: ${test.name} account (${test.email}) not found.`);
                continue;
            }
            const isValid = await user.comparePassword(password, user.password);
            console.log(`${test.name} Login (${test.email}): ${isValid ? 'SUCCESS' : 'FAIL'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Final verification failed:', error);
        process.exit(1);
    }
};

verifyAll();
