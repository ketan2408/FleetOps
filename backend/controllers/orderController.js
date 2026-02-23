const orderService = require('../services/orderService');
const Vendor = require('../models/Vendor');

// @desc    Create order (User only)
// @route   POST /api/orders
// @access  Private/User
const placeOrder = async (req, res, next) => {
    try {
        const { itemId, quantity, bookingDate, bookingTime, paymentMethod } = req.body;
        const order = await orderService.createOrder(req.user._id, itemId, quantity, bookingDate, bookingTime, paymentMethod);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user orders
// @route   GET /api/orders/user/my-orders
// @access  Private/User
const getUserOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await orderService.getUserOrders(req.user._id, parseInt(page), parseInt(limit));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/my-orders
// @access  Private/Vendor
const getVendorOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        // Previously: const vendor = await Vendor.findOne({ user: req.user._id });
        // Now: req.user IS the vendor document
        const result = await orderService.getVendorOrders(req.user._id, parseInt(page), parseInt(limit));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            res.status(404);
            return next(new Error('Order not found'));
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Vendor only)
// @route   PUT /api/orders/:orderId/status
// @access  Private/Vendor
const updateStatus = async (req, res, next) => {
    try {
        // req.user IS the vendor document now
        const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status, req.user._id);
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order (User only)
// @route   PUT /api/orders/:orderId/cancel
// @access  Private/User
const cancelOrder = async (req, res, next) => {
    try {
        const order = await orderService.cancelOrder(req.params.orderId, req.user._id);
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, vendorId, userId } = req.query;
        const result = await orderService.getAllOrders(parseInt(page), parseInt(limit), { status, vendorId, userId });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
const getOrderStats = async (req, res, next) => {
    try {
        const stats = await orderService.getOrderStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

// @desc    Process payment for order
// @route   POST /api/orders/:orderId/pay
// @access  Private/User
const payOrder = async (req, res, next) => {
    try {
        const { paymentMethod, transactionId } = req.body;
        const order = await orderService.processPayment(req.params.orderId, paymentMethod, transactionId);
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get receipt for an order (User only — must own the order)
// @route   GET /api/orders/:orderId/receipt
// @access  Private/User
const getOrderReceipt = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            res.status(404);
            return next(new Error('Order not found'));
        }
        // Only the customer who placed the order can view the receipt
        if (order.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            return next(new Error('Not authorised to view this receipt'));
        }
        res.json({
            orderId: order._id,
            transactionId: order.transactionId,
            item: order.item?.name,
            vendor: order.vendor?.companyName,
            vendorPhone: order.vendor?.phone,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            bookingDate: order.bookingDate,
            bookingTime: order.bookingTime,
            status: order.status,
            createdAt: order.createdAt
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { placeOrder, updateStatus, getVendorOrders, getUserOrders, getOrderById, cancelOrder, getAllOrders, getOrderStats, payOrder, getOrderReceipt };
