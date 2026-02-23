const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const User = require('../models/User'); // Keep for legacy/migration if needed
const generateToken = require('../utils/generateToken');

// Helper to get model by role
const getModelByRole = (role) => {
    switch (role) {
        case 'ADMIN': return Admin;
        case 'VENDOR': return Vendor;
        case 'USER': return Customer;
        default: return Customer;
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password, role, companyName, phone, vendorType, subCategory } = req.body;
    const targetRole = role || 'USER';

    try {
        // Check all collections for unique email
        const [adminExists, vendorExists, customerExists] = await Promise.all([
            Admin.findOne({ email }),
            Vendor.findOne({ email }),
            Customer.findOne({ email })
        ]);

        if (adminExists || vendorExists || customerExists) {
            res.status(409);
            return next(new Error('User with this email already exists'));
        }

        let user;
        if (targetRole === 'VENDOR') {
            user = await Vendor.create({
                email,
                password,
                companyName: companyName || `${name}'s Company`,
                phone: phone || undefined,
                vendorType: vendorType || 'REPAIR',
                subCategory: subCategory || 'GENERAL_SERVICE'
            });
        } else if (targetRole === 'ADMIN') {
            user = await Admin.create({ name, email, password });
        } else {
            user = await Customer.create({ name, email, password, phone });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name || user.companyName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        console.error('Registration Error:', error);
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    try {
        // Try to find user in each collection sequentially or in parallel
        // For performance and clarity, parallel check
        console.log(`Login attempt for email: ${email}`);
        const [admin, vendor, customer] = await Promise.all([
            Admin.findOne({ email }).select('+password'),
            Vendor.findOne({ email }).select('+password'),
            Customer.findOne({ email }).select('+password')
        ]);

        console.log(`Admin found: ${!!admin}, Vendor found: ${!!vendor}, Customer found: ${!!customer}`);

        const user = admin || vendor || customer;

        if (!user) {
            console.log('User not found in any collection');
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        console.log(`User found with ID: ${user._id} and Role: ${user.role}`);

        if (!user.isActive) {
            console.log('User account is inactive');
            res.status(403);
            return next(new Error('Your account has been deactivated'));
        }

        const isValidPassword = await user.comparePassword(password, user.password);
        console.log(`Password length received: ${password.length}`);
        console.log(`First char: ${password[0]}, Last char: ${password[password.length-1]}`);
        console.log(`Password valid: ${isValidPassword}`);
        
        if (!isValidPassword) {
            console.log('Password mismatch');
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name || user.companyName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const Model = getModelByRole(req.user.role);
        const user = await Model.findById(req.user._id);
        
        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        // Standardize output
        const profile = {
            _id: user._id,
            name: user.name || user.companyName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        };

        // Add extra vendor fields if it's a vendor
        if (user.role === 'VENDOR') {
            profile.vendor = user; // The vendor object IS the user record now
        }

        res.json(profile);
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, companyName, description, address, city, state, zipCode, vendorType, subCategory } = req.body;
        const Model = getModelByRole(req.user.role);
        const user = await Model.findById(req.user._id);

        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        // Update basic info
        if (name) user.name = name.trim();
        if (phone) user.phone = phone;

        // Role-specific updates
        if (user.role === 'VENDOR') {
            // Determine if significant business info is changing
            const isInfoChanging = 
                (companyName && companyName !== user.companyName) ||
                (description && description !== user.description) ||
                (address && address !== user.address) ||
                (city && city !== user.city) ||
                (state && state !== user.state) ||
                (zipCode && zipCode !== user.zipCode);

            user.companyName = companyName || user.companyName;
            user.description = description !== undefined ? description : user.description;
            user.phone = phone !== undefined ? phone : user.phone;
            user.address = address !== undefined ? address : user.address;
            user.city = city !== undefined ? city : user.city;
            user.state = state !== undefined ? state : user.state;
            user.zipCode = zipCode !== undefined ? zipCode : user.zipCode;
            user.vendorType = vendorType || user.vendorType;
            user.subCategory = subCategory || user.subCategory;

            // Mark profile as submitted
            user.businessProfileSubmitted = true;
            
            // Reset approval status ONLY if significant business info changes
            if (isInfoChanging) {
                user.approved = false;
            }
        }

        await user.save();

        res.json({
            message: user.role === 'VENDOR' 
                ? 'Profile updated successfully. Your business details are pending admin approval.' 
                : 'Profile updated successfully.',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const skip = (page - 1) * limit;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Determine which model to query
        // If role is VENDOR, it should use getAllVendors, but we'll handle it if requested here
        let TargetModel = Customer;
        if (role === 'ADMIN') TargetModel = Admin;
        if (role === 'VENDOR') TargetModel = Vendor;

        const users = await TargetModel.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TargetModel.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all vendors (Admin only)
// @route   GET /api/auth/vendors
// @access  Private/Admin
const getAllVendors = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, approved, search } = req.query;
        const skip = (page - 1) * limit;
        const query = {};

        if (approved !== undefined) {
            query.approved = approved === 'true';
        }

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const vendors = await Vendor.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Vendor.countDocuments(query);

        res.json({
            vendors,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve vendor (Admin only)
// @route   PUT /api/auth/vendors/:vendorId/approve
// @access  Private/Admin
const approveVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.vendorId,
            { 
                approved: true,
                isSubscribed: true,
                subscriptionTier: 'BASIC'
            },
            { new: true }
        );

        if (!vendor) {
            res.status(404);
            return next(new Error('Vendor not found'));
        }

        res.json({
            message: 'Vendor approved successfully',
            vendor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deactivate user (Admin only)
// @route   PUT /api/auth/users/:userId/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
    try {
        // Since we don't know the role from the ID alone without checking, we could check collections
        // But for admin dashboard, it usually targets Customers
        const user = await Customer.findByIdAndUpdate(
            req.params.userId,
            { isActive: false },
            { new: true }
        ) || await Admin.findByIdAndUpdate(
            req.params.userId,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        res.json({
            message: 'User deactivated successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Subscribe vendor
// @route   PUT /api/auth/vendors/subscribe
// @access  Private/Vendor
const subscribeVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.user._id);
        if (!vendor) {
            res.status(404);
            return next(new Error('Vendor profile not found'));
        }

        const { tier, paymentMethod } = req.body;
        const transactionId = `SUB_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        vendor.isSubscribed = true;
        vendor.subscriptionTier = tier || 'BASIC';
        vendor.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        await vendor.save();
        
        res.json({ 
            message: 'Subscribed successfully', 
            vendor,
            receipt: {
                transactionId,
                date: new Date(),
                amount: tier === 'PREMIUM' ? 99.99 : 49.99,
                plan: vendor.subscriptionTier,
                paymentMethod: paymentMethod || 'MOCK_PAYMENT'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update vendor subscription (Admin only)
// @route   PUT /api/auth/vendors/:vendorId/subscription
// @access  Private/Admin
const updateVendorSubscription = async (req, res, next) => {
    try {
        const { isSubscribed, subscriptionTier, subscriptionExpiry } = req.body;
        
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.vendorId,
            { 
                isSubscribed, 
                subscriptionTier, 
                subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : undefined 
            },
            { new: true }
        );

        if (!vendor) {
            res.status(404);
            return next(new Error('Vendor not found'));
        }

        res.json({
            message: 'Vendor subscription updated successfully',
            vendor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get approved & subscribed vendors for public/user view
// @route   GET /api/auth/vendors/public
// @access  Private (logged-in users)
const getPublicVendors = async (req, res, next) => {
    try {
        const { vendorType, subCategory } = req.query;
        // Require approved: true. 
        const query = { approved: true };
        if (vendorType) query.vendorType = vendorType;
        if (subCategory) query.subCategory = subCategory;

        const vendors = await Vendor.find(query)
            .select('-password -address -city -state -zipCode -phone')
            .sort({ isSubscribed: -1, subscriptionTier: -1, companyName: 1 });

        res.json({ vendors });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password - Reset password with email and new password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    let { email, newPassword } = req.body;
    console.log(`ForgotPassword: Request received for email: ${email}`);
    if (!email || !newPassword) {
        res.status(400);
        return next(new Error('Please provide email and new password'));
    }
    email = email.toLowerCase();

    try {
        console.log(`ForgotPassword: Searching for user with email: ${email}`);
        // Search in all collections
        const [admin, vendor, customer] = await Promise.all([
            Admin.findOne({ email }),
            Vendor.findOne({ email }),
            Customer.findOne({ email })
        ]);

        const user = admin || vendor || customer;

        if (!user) {
            console.log(`ForgotPassword: User ${email} not found in any collection`);
            res.status(400); // Changed from 404 to 400
            return next(new Error('User with this email does not exist'));
        }

        console.log(`ForgotPassword: Found user in ${user.role} collection. Updating password...`);
        // Update password
        user.password = newPassword;
        await user.save();
        console.log('ForgotPassword: Password updated and saved successfully');

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('ForgotPassword Error:', error);
        next(error);
    }
};

module.exports = {
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
};
