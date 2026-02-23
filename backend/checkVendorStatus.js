const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Item = require('./models/Item');
const dotenv = require('dotenv');

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const vendors = await Vendor.find().populate('user', 'name email');
        console.log(`\nFound ${vendors.length} vendors:`);
        vendors.forEach(v => {
            console.log(`- Vendor: ${v.companyName} | Approved: ${v.approved} | User: ${v.user?.email || 'N/A'}`);
        });

        const approvedVendors = await Vendor.find({ approved: true });
        console.log(`\nApproved Vendors Count: ${approvedVendors.length}`);

        const items = await Item.find().populate('vendor', 'companyName approved');
        console.log(`\nFound ${items.length} items:`);
        items.forEach(i => {
            console.log(`- Item: ${i.name} | Vendor: ${i.vendor?.companyName} | Vendor Approved: ${i.vendor?.approved}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkStatus();
