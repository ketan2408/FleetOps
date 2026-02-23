const Admin = require('../models/Admin');
const Plan = require('../models/Plan');

const defaultPlans = [
    {
        name: 'BASIC',
        description: 'Get started with basic marketplace visibility.',
        price: 9.99,
        durationDays: 30,
        features: ['Listed in marketplace', 'Up to 10 products', 'Basic analytics'],
        isActive: true
    },
    {
        name: 'STANDARD',
        description: 'Grow your business with enhanced features.',
        price: 24.99,
        durationDays: 30,
        features: ['Listed in marketplace', 'Up to 50 products', 'Priority listing', 'Advanced analytics'],
        isActive: true
    },
    {
        name: 'PREMIUM',
        description: 'Maximum visibility and all platform features.',
        price: 49.99,
        durationDays: 30,
        features: ['Featured badge', 'Unlimited products', 'Top search ranking', 'Full analytics', 'Priority support'],
        isActive: true
    }
];

const seedAdmin = async () => {
    try {
        const adminEmail = 'fleetops@gmail.com';
        const adminExists = await Admin.findOne({ email: adminEmail });

        if (!adminExists) {
            await Admin.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'ADMIN',
                isActive: true
            });
            console.log('Admin user seeded successfully in admin collection');
        } else {
            console.log('Admin user already exists in admin collection');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
    }

    // Seed default plans
    try {
        const planCount = await Plan.countDocuments();
        if (planCount === 0) {
            await Plan.insertMany(defaultPlans);
            console.log('Default subscription plans seeded successfully');
        } else {
            console.log('Subscription plans already exist');
        }
    } catch (error) {
        console.error('Error seeding plans:', error.message);
    }
};

module.exports = seedAdmin;
