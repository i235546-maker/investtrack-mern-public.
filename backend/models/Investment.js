const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['stock', 'crypto', 'mutualfund'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    stopLossPercent: {
        type: Number,
        default: 10
    },
    takeProfitPercent: {
        type: Number,
        default: 20
    }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
