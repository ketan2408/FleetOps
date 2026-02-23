const express = require('express');
const router = express.Router();
const {
    placeOrder,
    updateStatus,
    getVendorOrders,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    payOrder,
    getOrderReceipt
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateOrder, validateOrderStatus, validatePagination } = require('../middleware/validationMiddleware');

// Admin routes
router.get('/', protect, authorize('ADMIN'), validatePagination, getAllOrders);
router.get('/stats/overview', protect, authorize('ADMIN'), getOrderStats);

// User routes
router.post('/', protect, authorize('USER'), validateOrder, placeOrder);
router.get('/user/my-orders', protect, authorize('USER'), validatePagination, getUserOrders);
router.get('/:orderId', protect, getOrderById);
router.put('/:orderId/cancel', protect, authorize('USER'), cancelOrder);
router.post('/:orderId/pay', protect, authorize('USER'), payOrder);
router.get('/:orderId/receipt', protect, authorize('USER'), getOrderReceipt);

// Vendor routes
router.get('/vendor/my-orders', protect, authorize('VENDOR'), validatePagination, getVendorOrders);
router.put('/:orderId/status', protect, authorize('VENDOR'), validateOrderStatus, updateStatus);

module.exports = router;
