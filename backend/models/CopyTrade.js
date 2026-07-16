const mongoose = require('mongoose');

const copyTradeSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    traderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    allocation: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    maxTradeSize: {
        type: Number,
        required: true
    },
    stopLoss: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalTrades: {
        type: Number,
        default: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

copyTradeSchema.index({ followerId: 1, traderId: 1 }, { unique: true });

module.exports = mongoose.model('CopyTrade', copyTradeSchema);