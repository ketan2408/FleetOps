const express = require('express');
const router = express.Router();
const {
    getItems,
    getFeaturedItems,
    searchItems,
    getItemsByCategory,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    getVendorItems
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateItem, validatePagination } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', validatePagination, getItems);
router.get('/featured', getFeaturedItems);
router.get('/search/:query', validatePagination, searchItems);
router.get('/category/:category', validatePagination, getItemsByCategory);
router.get('/:itemId', getItem);

// Vendor protected routes
router.post('/', protect, authorize('VENDOR'), validateItem, addItem);
router.put('/:id', protect, authorize('VENDOR'), validateItem, updateItem);
router.delete('/:id', protect, authorize('VENDOR'), deleteItem);
router.get('/vendor/my-items', protect, authorize('VENDOR'), validatePagination, getVendorItems);

module.exports = router;
