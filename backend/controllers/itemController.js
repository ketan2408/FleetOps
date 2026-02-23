const itemService = require('../services/itemService');
const Vendor = require('../models/Vendor');

// @desc    Get all items with pagination, search, and filters
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, category, available, vendorId } = req.query;
        
        const result = await itemService.getItems(
            parseInt(page),
            parseInt(limit),
            { search, category, available: available === 'true', vendorId }
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured items
// @route   GET /api/items/featured
// @access  Public
const getFeaturedItems = async (req, res, next) => {
    try {
        const items = await itemService.getFeaturedItems();
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc    Search items
// @route   GET /api/items/search/:query
// @access  Public
const searchItems = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { query } = req.params;

        const result = await itemService.searchItems(
            query,
            parseInt(page),
            parseInt(limit)
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get items by category
// @route   GET /api/items/category/:category
// @access  Public
const getItemsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await itemService.getItemsByCategory(
            category.toUpperCase(),
            parseInt(page),
            parseInt(limit)
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single item
// @route   GET /api/items/:itemId
// @access  Public
const getItem = async (req, res, next) => {
    try {
        const item = await itemService.getItemById(req.params.itemId);
        res.json(item);
    } catch (error) {
        res.status(404);
        next(error);
    }
};

// @desc    Create item (Vendor only)
// @route   POST /api/items
// @access  Private/Vendor
const addItem = async (req, res, next) => {
    try {
        // req.user IS the vendor document
        const item = await itemService.createItem(req.user._id, req.body);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Update item (Vendor only)
// @route   PUT /api/items/:itemId
// @access  Private/Vendor
const updateItem = async (req, res, next) => {
    try {
        // req.user IS the vendor document
        const item = await itemService.updateItem(req.params.id, req.user._id, req.body);
        res.json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete item (Vendor only)
// @route   DELETE /api/items/:itemId
// @access  Private/Vendor
const deleteItem = async (req, res, next) => {
    try {
        // req.user IS the vendor document
        await itemService.deleteItem(req.params.id, req.user._id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        if (error.message.includes('Unauthorized')) {
            res.status(403);
        }
        next(error);
    }
};

// @desc    Get vendor items
// @route   GET /api/items/vendor/my-items
// @access  Private/Vendor
const getVendorItems = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, category, available } = req.query;
        
        // req.user IS the vendor document
        const result = await itemService.getVendorItems(
            req.user._id,
            parseInt(page),
            parseInt(limit),
            { search, category, available: available === 'true' }
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { addItem, updateItem, getItems, deleteItem, getVendorItems, getFeaturedItems, searchItems, getItemsByCategory, getItem };
