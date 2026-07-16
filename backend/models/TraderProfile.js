const mongoose = require('mongoose');

const traderProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    tradingStyle: {
        type: String,
        enum: ['day-trader', 'swing-trader', 'position-trader', 'scalper'],
        default: 'swing-trader'
    },
    experience: {
        type: Number,
        min: 0
    },
    totalTrades: {
        type: Number,
        default: 0
    },
    successfulTrades: {
        type: Number,
        default: 0
    },
    winRate: {
        type: Number,
        default: 0
    },
    totalReturn: {
        type: Number,
        default: 0
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    performance: {
        daily: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 }
    },
    risk: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
    },
    achievements: [{
        name: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TraderProfile', traderProfileSchema);