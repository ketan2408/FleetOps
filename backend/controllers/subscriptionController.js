const SubscriptionRecord = require('../models/SubscriptionRecord');
const Plan = require('../models/Plan');
const Vendor = require('../models/Vendor');

// @desc    Vendor subscribes to a plan
// @route   POST /api/subscriptions
// @access  Private/Vendor
const subscribeToPlan = async (req, res, next) => {
    try {
        const { planId, paymentMethod } = req.body;
        
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

        const transactionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        const subscription = await SubscriptionRecord.create({
            vendor: vendor._id,
            plan: plan._id,
            amount: plan.price,
            paymentMethod: paymentMethod || 'MOCK_PAYMENT',
            transactionId,
            startDate,
            endDate,
            status: 'COMPLETED'
        });

        // Update Vendor profile
        vendor.isSubscribed = true;
        vendor.subscriptionTier = plan.name;
        vendor.subscriptionExpiry = endDate;
        await vendor.save();

        // Re-fetch subscription with populated plan to ensure correct response shape
        const populatedSubscription = await SubscriptionRecord.findById(subscription._id).populate('plan');

        res.status(201).json({
            message: 'Subscription successful',
            subscription: {
                _id: populatedSubscription._id,
                transactionId: populatedSubscription.transactionId,
                startDate: populatedSubscription.startDate,
                endDate: populatedSubscription.endDate,
                amount: populatedSubscription.amount,
                paymentMethod: populatedSubscription.paymentMethod,
                status: populatedSubscription.status,
                plan: {
                    _id: plan._id,
                    name: plan.name,
                    price: plan.price,
                    durationDays: plan.durationDays
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor's subscription history
// @route   GET /api/subscriptions/my
// @access  Private/Vendor
const getMySubscriptions = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        const history = await SubscriptionRecord.find({ vendor: vendor._id })
            .populate('plan')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all subscriptions (Admin only)
// @route   GET /api/subscriptions
// @access  Private/Admin
const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await SubscriptionRecord.find()
            .populate({
                path: 'vendor',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('plan')
            .sort({ createdAt: -1 });
        res.json(subscriptions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subscribeToPlan,
    getMySubscriptions,
    getAllSubscriptions
};
