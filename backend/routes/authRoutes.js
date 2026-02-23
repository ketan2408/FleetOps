const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    getAllUsers,
    getAllVendors,
    getPublicVendors,
    approveVendor,
    deactivateUser,
    subscribeVendor,
    updateVendorSubscription,
    forgotPassword
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/vendors/subscribe', protect, subscribeVendor);
router.get('/vendors/public', protect, getPublicVendors);

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.get('/vendors', protect, admin, getAllVendors);
router.put('/vendors/:vendorId/approve', protect, admin, approveVendor);
router.put('/vendors/:vendorId/subscription', protect, admin, updateVendorSubscription);
router.put('/users/:userId/deactivate', protect, admin, deactivateUser);

module.exports = router;
