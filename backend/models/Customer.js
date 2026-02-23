const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
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
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Please provide a valid phone number']
    },
    role: {
        type: String,
        default: 'USER'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

// Hash password before saving
customerSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    // Skip hashing if it already looks like a bcrypt hash
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
customerSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('Customer', customerSchema, 'user');
