const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    deviceToken: {
        type: String
    },
    subscription: {
        type: {
            type: String,
            enum: ['free', 'premium', 'pro'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        isActive: {
            type: Boolean,
            default: true
        },
        autoRenew: {
            type: Boolean,
            default: false
        }
    },
    tradingBalance: {
        type: Number,
        default: 0
    },
    portfolio: [{
        symbol: String,
        type: {
            type: String,
            enum: ['stock', 'forex']
        },
        quantity: Number,
        averagePrice: Number,
        totalInvested: Number
    }],
    watchlist: [{
        symbol: String,
        type: {
            type: String,
            enum: ['stock', 'forex']
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            priceAlerts: { type: Boolean, default: false }
        },
        tradingPreferences: {
            riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
            preferredMarkets: [String],
            tradeSize: { type: Number, default: 1000 }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);