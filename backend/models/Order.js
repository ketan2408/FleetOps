const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: [true, 'Order must belong to a customer']
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: [true, 'Order must involve a vendor']
    },
    item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
        required: [true, 'Order must contain an item']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity'],
        min: [1, 'Quantity cannot be less than 1']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['CREATED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'CREATED'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        default: 'MOCK_PAYMENT'
    },
    transactionId: {
        type: String
    },
    bookingDate: {
        type: String
    },
    bookingTime: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
