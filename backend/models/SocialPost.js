const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
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
        enum: ['buy', 'sell', 'analysis'],
        required: true
    },
    price: {
        type: Number
    },
    targetPrice: {
        type: Number
    },
    stopLoss: {
        type: Number
    },
    chartImage: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    sentiment: {
        type: String,
        enum: ['bullish', 'bearish', 'neutral'],
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

socialPostSchema.index({ userId: 1, createdAt: -1 });
socialPostSchema.index({ symbol: 1, tradeType: 1 });
socialPostSchema.index({ tags: 1 });

module.exports = mongoose.model('SocialPost', socialPostSchema);