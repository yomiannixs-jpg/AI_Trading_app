const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tradeType: {
        type: String,
        enum: ['stock', 'forex'],
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    orderType: {
        type: String,
        enum: ['market', 'limit', 'stop'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    fees: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'executed', 'cancelled', 'failed'],
        default: 'pending'
    },
    limitPrice: {
        type: Number
    },
    stopPrice: {
        type: Number
    },
    executedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, tradeType: 1 });

module.exports = mongoose.model('Trade', tradeSchema);