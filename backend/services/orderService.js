const Order = require('../models/Order');
const Item = require('../models/Item');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

class OrderService {
    // Create a new order
    async createOrder(userId, itemId, quantity, bookingDate, bookingTime, paymentMethod) {
        const item = await Item.findById(itemId).populate('vendor');
        if (!item) throw new Error('Item not found');
        if (!item.available) throw new Error('Item is not available');
        if (quantity > item.stock) throw new Error(`Only ${item.stock} items in stock`);

        const totalAmount = item.price * quantity;
        const order = await Order.create({
            user: userId,
            vendor: item.vendor._id,
            item: itemId,
            quantity,
            totalAmount,
            paymentStatus: paymentMethod ? 'COMPLETED' : 'PENDING',
            paymentMethod: paymentMethod || 'MOCK_PAYMENT',
            transactionId: paymentMethod ? `TXN_${Date.now()}` : null,
            bookingDate,
            bookingTime
        });

        // Update vendor total orders
        await Vendor.findByIdAndUpdate(item.vendor._id, {
            $inc: { totalOrders: 1 }
        });

        return await order.populate('user item vendor');
    }

    // Process payment (Mock)
    async processPayment(orderId, paymentMethod, transactionId) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        order.paymentStatus = 'COMPLETED';
        order.paymentMethod = paymentMethod || 'MOCK_PAYMENT';
        order.transactionId = transactionId || `TXN_${Date.now()}`;
        
        // If payment is completed, the order can be moved to ACCEPTED automatically or stay CREATED
        // For this flow, let's keep it CREATED but MARKED AS PAID
        
        await order.save();
        return await order.populate('user item vendor');
    }

    // Get user orders with pagination
    async getUserOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const orders = await Order.find({ user: userId })
            .populate('item vendor')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: userId });
        return {
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Get vendor orders
    async getVendorOrders(vendorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const orders = await Order.find({ vendor: vendorId })
            .populate('user item')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ vendor: vendorId });
        return {
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Update order status
    async updateOrderStatus(orderId, status, vendorId) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');
        
        // Verify vendor ownership
        if (order.vendor.toString() !== vendorId) {
            throw new Error('Unauthorized to update this order');
        }

        // Validate status transitions
        const validTransitions = {
            'CREATED': ['ACCEPTED', 'REJECTED'],
            'ACCEPTED': ['IN_PROGRESS', 'REJECTED'],
            'IN_PROGRESS': ['COMPLETED', 'REJECTED'],
            'COMPLETED': [],
            'REJECTED': [],
            'CANCELLED': []
        };

        if (!validTransitions[order.status]?.includes(status)) {
            throw new Error(`Cannot transition from ${order.status} to ${status}`);
        }

        order.status = status;
        await order.save();
        return order.populate('user item vendor');
    }

    // Cancel order
    async cancelOrder(orderId, userId) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        if (order.user.toString() !== userId) {
            throw new Error('Unauthorized to cancel this order');
        }

        if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(order.status)) {
            throw new Error(`Cannot cancel order with status ${order.status}`);
        }

        order.status = 'CANCELLED';
        await order.save();
        return order;
    }

    // Get order by ID
    async getOrderById(orderId) {
        return await Order.findById(orderId)
            .populate('user item vendor');
    }

    // Get all orders (admin only)
    async getAllOrders(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};

        if (filters.status) query.status = filters.status;
        if (filters.vendorId) query.vendor = filters.vendorId;
        if (filters.userId) query.user = filters.userId;

        const orders = await Order.find(query)
            .populate('user item vendor')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);
        return {
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    // Get order statistics (admin)
    async getOrderStats() {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statsByStatus: stats
        };
    }
}

module.exports = new OrderService();
