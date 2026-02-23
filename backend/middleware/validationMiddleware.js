// Input validation middleware
const validateRegister = (req, res, next) => {
    const { name, email, password, role, companyName } = req.body;

    // Trim inputs
    if (name) req.body.name = name.trim();
    if (email) req.body.email = email.trim().toLowerCase();

    // Validate required fields
    if (!name || !email || !password) {
        res.status(400);
        return next(new Error('Name, email, and password are required'));
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        return next(new Error('Invalid email format'));
    }

    // Validate password length
    if (password.length < 6) {
        res.status(400);
        return next(new Error('Password must be at least 6 characters'));
    }

    // Validate name length
    if (name.length < 2) {
        res.status(400);
        return next(new Error('Name must be at least 2 characters'));
    }

    // For vendor role, company name is required
    if (role === 'VENDOR' && !companyName) {
        res.status(400);
        return next(new Error('Company name is required for vendors'));
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        return next(new Error('Email and password are required'));
    }

    req.body.email = email.trim().toLowerCase();
    next();
};

const validateItem = (req, res, next) => {
    const { name, description, price, category } = req.body;

    if (!name || !description || price === undefined) {
        res.status(400);
        return next(new Error('Name, description, and price are required'));
    }

    if (name.length < 3) {
        res.status(400);
        return next(new Error('Item name must be at least 3 characters'));
    }

    if (description.length < 10) {
        res.status(400);
        return next(new Error('Description must be at least 10 characters'));
    }

    if (price <= 0) {
        res.status(400);
        return next(new Error('Price must be greater than 0'));
    }

    // Trim inputs
    req.body.name = name.trim();
    req.body.description = description.trim();

    next();
};

const validateOrder = (req, res, next) => {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
        res.status(400);
        return next(new Error('Item ID and quantity are required'));
    }

    if (quantity < 1) {
        res.status(400);
        return next(new Error('Quantity must be at least 1'));
    }

    if (!Number.isInteger(quantity)) {
        res.status(400);
        return next(new Error('Quantity must be a whole number'));
    }

    next();
};

const validateOrderStatus = (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['CREATED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!status) {
        res.status(400);
        return next(new Error('Status is required'));
    }

    if (!validStatuses.includes(status.toUpperCase())) {
        res.status(400);
        return next(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    req.body.status = status.toUpperCase();
    next();
};

const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || page < 1)) {
        res.status(400);
        return next(new Error('Page must be a positive number'));
    }

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        res.status(400);
        return next(new Error('Limit must be a number between 1 and 100'));
    }

    req.query.page = page ? parseInt(page) : 1;
    req.query.limit = limit ? parseInt(limit) : 10;

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateItem,
    validateOrder,
    validateOrderStatus,
    validatePagination
};
