const mongoose = require('mongoose');

const subscriptionRecordSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: [true, 'Subscription must belong to a vendor']
    },
    plan: {
        type: mongoose.Schema.ObjectId,
        ref: 'Plan',
        required: [true, 'Subscription must be for a plan']
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'MOCK_PAYMENT'
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionRecord', subscriptionRecordSchema);
