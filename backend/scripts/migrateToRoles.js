const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const migrate = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for migration...');

        const legacyUsers = await User.find({}).select('+password');
        console.log(`Found ${legacyUsers.length} legacy users.`);

        for (const user of legacyUsers) {
            console.log(`Processing user: ${user.email} (${user.role})`);
            if (user.role === 'ADMIN') {
                const exists = await Admin.findOne({ email: user.email });
                if (!exists) {
                    await Admin.create({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        isActive: user.isActive,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt
                    });
                    console.log(`Migrated Admin: ${user.email}`);
                } else {
                    console.log(`Admin already exists: ${user.email}`);
                }
            } else if (user.role === 'USER') {
                const exists = await Customer.findOne({ email: user.email });
                if (!exists) {
                    await Customer.create({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        phone: user.phone,
                        isActive: user.isActive,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt
                    });
                    console.log(`Migrated Customer: ${user.email}`);
                } else {
                    console.log(`Customer already exists: ${user.email}`);
                }
            } else if (user.role === 'VENDOR') {
                const vendorRecord = await Vendor.findOne({ 
                    $or: [
                        { _id: user._id },
                        { email: user.email }
                    ]
                });

                if (vendorRecord) {
                    vendorRecord.email = user.email;
                    vendorRecord.password = user.password;
                    await vendorRecord.save();
                    console.log(`Updated Vendor auth for: ${user.email}`);
                } else {
                    await Vendor.create({
                        _id: user._id,
                        email: user.email,
                        password: user.password,
                        companyName: `${user.name}'s Business`,
                        role: 'VENDOR',
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    });
                    console.log(`Created standalone Vendor: ${user.email}`);
                }
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach((key) => {
                console.error(`Validation Error on field ${key}: ${error.errors[key].message}`);
            });
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
