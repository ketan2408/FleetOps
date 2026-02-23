const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'VENDOR'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    vendorType: {
        type: String,
        enum: ['REPAIR', 'VEHICLE_SALES'],
        default: 'REPAIR'
    },
    subCategory: {
        type: String,
        enum: ['GENERAL_SERVICE', 'NEW_CARS', 'USED_CARS'],
        default: 'GENERAL_SERVICE'
    },
    companyName: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true,
        minlength: [3, 'Company name must be at least 3 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zipCode: {
        type: String
    },
    approved: {
        type: Boolean,
        default: false
    },
    businessProfileSubmitted: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    subscriptionTier: {
        type: String,
        default: 'BASIC'
    },
    subscriptionExpiry: {
        type: Date
    }
}, { timestamps: true });

// Hash password before saving
vendorSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    // Skip hashing if it already looks like a bcrypt hash
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
vendorSchema.methods.comparePassword = async function(candidatePassword, vendorPassword) {
    return await bcrypt.compare(candidatePassword, vendorPassword);
};

module.exports = mongoose.model('Vendor', vendorSchema, 'vendor');
