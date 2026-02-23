const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a plan name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    durationDays: {
        type: Number,
        required: [true, 'Please provide duration in days'],
        min: [1, 'Duration must be at least 1 day']
    },
    features: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
