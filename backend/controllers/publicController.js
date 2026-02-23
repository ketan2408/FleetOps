const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

// @desc    Get public statistics
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res, next) => {
    try {
        const [totalUsers, totalVendors, totalOrders, revenueData] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            Vendor.countDocuments({ approved: true }),
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }])
        ]);

        res.json({
            totalUsers,
            totalVendors,
            totalOrders,
            totalRevenue: revenueData[0]?.total || 0
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single vendor's public profile (live fetch)
// @route   GET /api/public/vendors/:vendorId
// @access  Public
const getSingleVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({
            _id: req.params.vendorId,
            approved: true,
            isSubscribed: true
        });

        if (!vendor) {
            res.status(404);
            return next(new Error('Vendor not found or not available'));
        }

        res.json({ vendor });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPublicStats, getSingleVendor };
