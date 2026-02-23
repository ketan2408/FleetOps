const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from one level up
dotenv.config({ path: path.join(__dirname, '../.env') });

const planSchema = new mongoose.Schema({
    name: String,
    isActive: Boolean
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

const listPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetops');
        const plans = await Plan.find();
        console.log('--- DB PLANS ---');
        console.log(JSON.stringify(plans, null, 2));
        console.log('----------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listPlans();
