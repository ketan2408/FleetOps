const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: [true, 'Item must belong to a vendor']
    },
    name: {
        type: String,
        required: [true, 'Please provide an item name'],
        trim: true,
        minlength: [3, 'Item name must be at least 3 characters'],
        maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0.01, 'Price must be greater than 0']
    },
    category: {
        type: String,
        enum: ['MAINTENANCE', 'REPAIR', 'SERVICE', 'CAR', 'OTHER'],
        default: 'SERVICE'
    },
    // Vehicle specific fields
    brand: String,
    model: String,
    year: Number,
    transmission: {
        type: String,
        enum: ['MANUAL', 'AUTOMATIC', 'SEMI-AUTOMATIC'],
    },
    fuelType: {
        type: String,
        enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'],
    },
    mileage: Number,
    seatCount: Number,
    // New category specific fields
    condition: {
        type: String,
        enum: ['NEW', 'USED'],
        default: 'NEW'
    },
    duration: String, // For services
    warranty: String,
    color: String,
    vin: String,
    engineCapacity: String,
    features: String,
    previousOwners: Number,
    available: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    }
}, { timestamps: true });

// Index for search
itemSchema.index({ name: 'text', description: 'text', brand: 'text', model: 'text' });

module.exports = mongoose.model('Item', itemSchema);
