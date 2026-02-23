const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Choose the right model based on role in JWT
            let Model;
            switch (decoded.role) {
                case 'ADMIN': Model = Admin; break;
                case 'VENDOR': Model = Vendor; break;
                case 'USER': Model = Customer; break;
                default: Model = Customer;
            }

            req.user = await Model.findById(decoded.id).select('-password');
            
            if (!req.user) {
                res.status(401);
                return next(new Error('User not found in ' + decoded.role + ' records'));
            }

            if (!req.user.isActive) {
                res.status(403);
                return next(new Error('Account is inactive'));
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403);
        return next(new Error('Not authorized as an admin'));
    }
};

const vendor = (req, res, next) => {
    if (req.user && req.user.role === 'VENDOR') {
        next();
    } else {
        res.status(403);
        return next(new Error('Not authorized as a vendor'));
    }
};

module.exports = { protect, admin, vendor };
