const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('./models/Order');
const User = require('./models/User');
const Item = require('./models/Item');
const Vendor = require('./models/Vendor');

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetops');
        const orders = await Order.find().populate('user item vendor');
        console.log('--- DB ORDERS ---');
        console.log(JSON.stringify(orders, null, 2));
        console.log('Total Orders:', orders.length);
        console.log('----------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrders();
