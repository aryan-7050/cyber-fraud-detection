const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0.01, 'Amount must be greater than 0']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    type: {
        type: String,
        enum: ['debit', 'credit', 'transfer'],
        required: true
    },
    recipient: {
        name: String,
        accountNumber: String,
        bankName: String,
        email: String
    },
    sender: {
        name: String,
        accountNumber: String,
        location: String
    },
    location: {
        city: String,
        country: String,
        ipAddress: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'flagged'],
        default: 'pending'
    },
    fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    fraudReason: {
        type: [String],
        default: []
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    isFraudulent: {
        type: Boolean,
        default: false
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    notes: String
});

// Index for faster queries
transactionSchema.index({ user: 1, timestamp: -1 });
transactionSchema.index({ status: 1, isFraudulent: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);