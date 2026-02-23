const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const checkCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const results = {
            admins: await Admin.countDocuments(),
            customers: await Customer.countDocuments(),
            vendors: await Vendor.countDocuments(),
            legacyUsers: await User.countDocuments(),
            collections: await mongoose.connection.db.listCollections().toArray()
        };

        fs.writeFileSync(path.resolve(__dirname, 'counts.json'), JSON.stringify(results, null, 2));
        console.log('Results saved to counts.json');
        process.exit(0);
    } catch (error) {
        console.error('Failed to check counts:', error);
        process.exit(1);
    }
};

checkCounts();
