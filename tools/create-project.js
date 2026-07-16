const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create directory structure
const createDirectories = () => {
    const dirs = [
        'ai-trading-app',
        'ai-trading-app/backend',
        'ai-trading-app/backend/models',
        'ai-trading-app/backend/routes',
        'ai-trading-app/backend/services',
        'ai-trading-app/backend/middleware',
        'ai-trading-app/backend/utils',
        'ai-trading-app/backend/config',
        'ai-trading-app/frontend',
        'ai-trading-app/frontend/src',
        'ai-trading-app/frontend/src/components',
        'ai-trading-app/frontend/src/pages',
        'ai-trading-app/frontend/src/services',
        'ai-trading-app/frontend/src/contexts',
        'ai-trading-app/frontend/src/styles',
        'ai-trading-app/frontend/src/utils',
        'ai-trading-app/frontend/public',
        'ai-trading-app/mobile',
        'ai-trading-app/mobile/src',
        'ai-trading-app/mobile/src/screens',
        'ai-trading-app/mobile/src/components',
        'ai-trading-app/mobile/src/contexts',
        'ai-trading-app/mobile/src/services',
        'ai-trading-app/mobile/src/navigation',
        'ai-trading-app/docs'
    ];

    dirs.forEach(dir => {
        fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
    });
};

// File contents for backend
const files = {
    // Backend - Main Server
    'backend/app.js': `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const predictionRoutes = require('./routes/predictions');
const subscriptionRoutes = require('./routes/subscriptions');
const socialRoutes = require('./routes/social');
const chartRoutes = require('./routes/charts');

// Import services
const chartingService = require('./services/chartingService');
const notificationService = require('./services/notificationService');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket for real-time data
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-trading-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Initialize services
chartingService.initialize(server);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/charts', chartRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date(),
        services: {
            websocket: true,
            database: mongoose.connection.readyState === 1
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
    console.log(\`WebSocket server running on ws://localhost:\${PORT}\`);
});

module.exports = { app, server };`,

    // Backend - Models
    'backend/models/User.js': `const mongoose = require('mongoose');
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

module.exports = mongoose.model('User', userSchema);`,

    'backend/models/Trade.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Trade', tradeSchema);`,

    'backend/models/SocialPost.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('SocialPost', socialPostSchema);`,

    'backend/models/TraderProfile.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('TraderProfile', traderProfileSchema);`,

    'backend/models/CopyTrade.js': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('CopyTrade', copyTradeSchema);`,

    // Backend - Middleware
    'backend/middleware/auth.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Invalid token' });
    }
};`,

    'backend/middleware/subscriptionCheck.js': `const User = require('../models/User');

module.exports = (requiredPlan) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            
            if (!user.subscription.isActive) {
                return res.status(403).json({ 
                    message: 'Subscription required',
                    requiredPlan 
                });
            }
            
            const planHierarchy = ['free', 'premium', 'pro'];
            const userPlanIndex = planHierarchy.indexOf(user.subscription.type);
            const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
            
            if (userPlanIndex < requiredPlanIndex) {
                return res.status(403).json({ 
                    message: \`This feature requires \${requiredPlan} subscription\`,
                    currentPlan: user.subscription.type,
                    requiredPlan 
                });
            }
            
            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};`,

    // Backend - Services
    'backend/services/aiPredictor.js': `const tf = require('@tensorflow/tfjs-node');
const TechnicalIndicators = require('./technicalIndicators');

class AIPredictor {
    constructor() {
        this.stockModel = null;
        this.forexModel = null;
        this.indicators = new TechnicalIndicators();
        this.initializeModels();
    }

    async initializeModels() {
        // LSTM model for stock predictions
        this.stockModel = tf.sequential({
            layers: [
                tf.layers.lstm({ units: 50, returnSequences: true, inputShape: [60, 8] }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 50, returnSequences: true }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 50 }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 1 })
            ]
        });

        this.stockModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError'
        });

        // Similar model for forex
        this.forexModel = tf.sequential({
            layers: [
                tf.layers.lstm({ units: 50, returnSequences: true, inputShape: [60, 8] }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 50, returnSequences: true }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 50 }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 1 })
            ]
        });

        this.forexModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError'
        });
    }

    async fetchMarketData(symbol, type = 'stock') {
        // Simulate fetching market data
        // In production, connect to real APIs
        const data = [];
        let basePrice = this.getBasePrice(symbol, type);
        const volatility = basePrice * 0.02;
        
        for (let i = 0; i < 200; i++) {
            const open = basePrice + (Math.random() - 0.5) * volatility;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);
            const volume = Math.random() * 1000000;
            
            data.push({ open, high, low, close, volume });
            basePrice = close;
        }
        
        return data;
    }

    getBasePrice(symbol, type) {
        const prices = {
            stocks: {
                'DANGCEM': 385.50,
                'MTNN': 235.00,
                'ZENITHBANK': 35.70,
                'GUARANTY': 44.20,
                'NB': 62.00,
                'UBA': 12.50,
                'ACCESS': 9.80,
                'FBNH': 15.30
            },
            forex: {
                'USD/NGN': 1590.50,
                'EUR/NGN': 1720.80,
                'GBP/NGN': 2015.30,
                'USD/JPY': 150.75,
                'EUR/USD': 1.0850,
                'GBP/USD': 1.2650
            }
        };
        
        return type === 'stock' ? 
            prices.stocks[symbol] || 100 : 
            prices.forex[symbol] || 1;
    }

    prepareData(data) {
        // Add technical indicators as features
        const enhancedData = data.map((d, i, arr) => {
            const closes = arr.slice(0, i + 1).map(x => x.close);
            const rsi = this.indicators.calculateRSI(closes, 14);
            const macd = this.indicators.calculateMACD(closes);
            
            return [
                d.open,
                d.high,
                d.low,
                d.close,
                d.volume,
                rsi.length > 0 ? rsi[rsi.length - 1].value : 50,
                macd.macdLine.length > 0 ? macd.macdLine[macd.macdLine.length - 1].value : 0,
                macd.signalLine.length > 0 ? macd.signalLine[macd.signalLine.length - 1].value : 0
            ];
        });

        const scaledData = this.scaleData(enhancedData);
        const X = [];
        const y = [];
        
        for (let i = 60; i < scaledData.length; i++) {
            X.push(scaledData.slice(i - 60, i));
            y.push(scaledData[i][3]); // Close price
        }
        
        return {
            X: tf.tensor3d(X),
            y: tf.tensor2d(y, [y.length, 1])
        };
    }

    scaleData(data) {
        const values = data.map(d => d);
        const mins = values[0].map((_, i) => Math.min(...values.map(v => v[i])));
        const maxs = values[0].map((_, i) => Math.max(...values.map(v => v[i])));
        
        return values.map(row => 
            row.map((val, i) => {
                const range = maxs[i] - mins[i];
                return range === 0 ? 0 : (val - mins[i]) / range;
            })
        );
    }

    async predict(symbol, type = 'stock') {
        const data = await this.fetchMarketData(symbol, type);
        const { X } = this.prepareData(data);
        
        const model = type === 'stock' ? this.stockModel : this.forexModel;
        const prediction = model.predict(X.slice([-1]));
        const predictedValue = prediction.dataSync()[0];
        
        const currentPrice = data[data.length - 1].close;
        const priceRange = Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low));
        const predictedPrice = predictedValue * priceRange + Math.min(...data.map(d => d.low));
        
        const percentChange = ((predictedPrice - currentPrice) / currentPrice) * 100;
        let action = 'HOLD';
        if (percentChange > 2) action = 'BUY';
        else if (percentChange < -2) action = 'SELL';
        
        const confidence = Math.min(Math.abs(percentChange) * 20, 95);
        
        // Get additional signals from technical analysis
        const closes = data.map(d => d.close);
        const rsi = this.indicators.calculateRSI(closes, 14);
        const macd = this.indicators.calculateMACD(closes);
        const bb = this.indicators.calculateBollingerBands(closes, 20, 2);
        
        const lastRSI = rsi.length > 0 ? rsi[rsi.length - 1].value : 50;
        const lastMACD = macd.macdLine.length > 0 ? macd.macdLine[macd.macdLine.length - 1].value : 0;
        const lastSignal = macd.signalLine.length > 0 ? macd.signalLine[macd.signalLine.length - 1].value : 0;
        const lastBB = bb.length > 0 ? bb[bb.length - 1] : null;
        
        return {
            symbol,
            type,
            currentPrice,
            predictedPrice,
            percentChange,
            action,
            confidence,
            technicalSignals: {
                rsi: lastRSI,
                rsiSignal: lastRSI > 70 ? 'overbought' : lastRSI < 30 ? 'oversold' : 'neutral',
                macd: lastMACD - lastSignal,
                macdSignal: lastMACD > lastSignal ? 'bullish' : 'bearish',
                bollingerBands: lastBB,
                volatility: this.calculateVolatility(data)
            },
            timestamp: new Date()
        };
    }

    calculateVolatility(data) {
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].close - data[i-1].close) / data[i-1].close);
        }
        
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
    }

    async trainModel(symbol, type = 'stock') {
        const data = await this.fetchMarketData(symbol, type);
        const { X, y } = this.prepareData(data);
        
        const model = type === 'stock' ? this.stockModel : this.forexModel;
        
        await model.fit(X, y, {
            epochs: 50,
            batchSize: 32,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(\`Epoch \${epoch + 1}: loss = \${logs.loss.toFixed(6)}\`);
                }
            }
        });
        
        return { message: 'Model trained successfully' };
    }
}

module.exports = new AIPredictor();`,

    'backend/services/technicalIndicators.js': `class TechnicalIndicators {
    calculateSMA(data, period) {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push({ index: i, value: sum / period });
        }
        return sma;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
        ema.push({ index: period - 1, value: sum / period });
        
        for (let i = period; i < data.length; i++) {
            const value = (data[i] - ema[ema.length - 1].value) * multiplier + ema[ema.length - 1].value;
            ema.push({ index: i, value });
        }
        
        return ema;
    }

    calculateMACD(data) {
        const ema12 = this.calculateEMA(data, 12);
        const ema26 = this.calculateEMA(data, 26);
        const macdLine = [];
        const signalLine = [];
        
        for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
            macdLine.push({
                index: ema12[i].index,
                value: ema12[i].value - ema26[i].value
            });
        }
        
        const macdValues = macdLine.map(m => m.value);
        signalLine.push(...this.calculateEMA(macdValues, 9));
        
        const histogram = macdLine.map((m, i) => ({
            index: m.index,
            value: m.value - (signalLine[i] ? signalLine[i].value : 0)
        }));
        
        return { macdLine, signalLine, histogram };
    }

    calculateRSI(data, period) {
        const rsi = [];
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const difference = data[i] - data[i - 1];
            if (difference >= 0) gains += difference;
            else losses -= difference;
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgGain / (avgLoss || 1);
        rsi.push({ index: period, value: 100 - (100 / (1 + rs)) });
        
        for (let i = period + 1; i < data.length; i++) {
            const difference = data[i] - data[i - 1];
            let currentGain = difference >= 0 ? difference : 0;
            let currentLoss = difference < 0 ? -difference : 0;
            
            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
            
            rs = avgGain / (avgLoss || 1);
            rsi.push({ index: i, value: 100 - (100 / (1 + rs)) });
        }
        
        return rsi;
    }

    calculateBollingerBands(data, period, stdDev) {
        const bands = [];
        const sma = this.calculateSMA(data, period);
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = sma.find(s => s.index === i)?.value || 0;
            const squaredDiffs = slice.map(x => Math.pow(x - mean, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            bands.push({
                index: i,
                upper: mean + (stdDev * standardDeviation),
                middle: mean,
                lower: mean - (stdDev * standardDeviation)
            });
        }
        
        return bands;
    }

    calculateFibonacciLevels(highs, lows) {
        const highest = Math.max(...highs);
        const lowest = Math.min(...lows);
        const diff = highest - lowest;
        
        return {
            level0: highest,
            level236: highest - diff * 0.236,
            level382: highest - diff * 0.382,
            level500: highest - diff * 0.5,
            level618: highest - diff * 0.618,
            level786: highest - diff * 0.786,
            level1000: lowest
        };
    }

    calculateVolumeProfile(data) {
        const priceLevels = {};
        const priceStep = 10;
        
        data.forEach(candle => {
            const priceLevel = Math.floor(candle.close / priceStep) * priceStep;
            if (!priceLevels[priceLevel]) {
                priceLevels[priceLevel] = 0;
            }
            priceLevels[priceLevel] += candle.volume;
        });
        
        return Object.entries(priceLevels).map(([price, volume]) => ({
            price: parseFloat(price),
            volume
        }));
    }

    findSupportResistance(highs, lows, closes) {
        const levels = [];
        const tolerance = 0.02;
        
        for (let i = 2; i < closes.length - 2; i++) {
            if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
                highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
                levels.push({
                    price: highs[i],
                    type: 'resistance',
                    strength: this.calculateLevelStrength(highs, i, tolerance)
                });
            }
            
            if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
                lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
                levels.push({
                    price: lows[i],
                    type: 'support',
                    strength: this.calculateLevelStrength(lows, i, tolerance)
                });
            }
        }
        
        return levels.sort((a, b) => b.strength - a.strength).slice(0, 10);
    }

    calculateLevelStrength(data, index, tolerance) {
        let touches = 1;
        const price = data[index];
        
        for (let i = 0; i < data.length; i++) {
            if (i === index) continue;
            const diff = Math.abs(data[i] - price) / price;
            if (diff <= tolerance) touches++;
        }
        
        return touches;
    }
}

module.exports = TechnicalIndicators;`,

    'backend/services/chartingService.js': `const WebSocket = require('ws');
const EventEmitter = require('events');
const TechnicalIndicators = require('./technicalIndicators');

class ChartingService extends EventEmitter {
    constructor() {
        super();
        this.wss = null;
        this.clients = new Map();
        this.marketData = new Map();
        this.timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
        this.indicators = new TechnicalIndicators();
        this.updateInterval = null;
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws'
        });
        
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            this.clients.set(clientId, { ws, subscriptions: new Set() });
            
            console.log(\`Client \${clientId} connected\`);
            
            ws.on('message', (message) => this.handleMessage(clientId, message));
            ws.on('close', () => {
                console.log(\`Client \${clientId} disconnected\`);
                this.clients.delete(clientId);
            });
            ws.on('error', (error) => {
                console.error(\`Client \${clientId} error:\`, error);
            });
        });

        this.startDataSimulation();
    }

    isActive() {
        return this.wss !== null;
    }

    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);
            const client = this.clients.get(clientId);
            if (!client) return;

            switch (data.type) {
                case 'subscribe':
                    this.handleSubscription(client, data);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscription(client, data);
                    break;
                case 'get_indicators':
                    this.sendIndicators(client.ws, data);
                    break;
                case 'get_historical':
                    this.sendHistoricalData(client.ws, data);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    handleSubscription(client, data) {
        const { symbol, timeframe } = data;
        if (!symbol || !timeframe) return;
        
        const key = \`\${symbol}_\${timeframe}\`;
        
        if (!client.subscriptions.has(key)) {
            client.subscriptions.add(key);
            this.sendInitialData(client.ws, symbol, timeframe);
        }
    }

    handleUnsubscription(client, data) {
        const { symbol, timeframe } = data;
        const key = \`\${symbol}_\${timeframe}\`;
        client.subscriptions.delete(key);
    }

    async sendInitialData(ws, symbol, timeframe) {
        const historicalData = await this.getHistoricalData(symbol, timeframe, 200);
        
        ws.send(JSON.stringify({
            type: 'historical_data',
            symbol,
            timeframe,
            data: historicalData
        }));

        const indicators = await this.calculateAllIndicators(historicalData);
        
        ws.send(JSON.stringify({
            type: 'indicators',
            symbol,
            timeframe,
            indicators
        }));
    }

    async getHistoricalData(symbol, timeframe, limit) {
        const data = [];
        let price = this.getBasePrice(symbol);
        const volatility = this.getVolatility(symbol);
        const interval = this.getTimeframeSeconds(timeframe);
        const now = Date.now();

        for (let i = limit; i >= 0; i--) {
            const timestamp = now - (i * interval * 1000);
            const open = price;
            const high = open + (Math.random() * volatility * 0.5);
            const low = open - (Math.random() * volatility * 0.5);
            const close = low + Math.random() * (high - low);
            const volume = Math.random() * 1000000;

            data.push({
                timestamp,
                open,
                high,
                low,
                close,
                volume
            });

            price = close;
        }

        return data;
    }

    async calculateAllIndicators(data) {
        const closes = data.map(d => d.close);
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);

        return {
            sma: {
                sma20: this.indicators.calculateSMA(closes, 20),
                sma50: this.indicators.calculateSMA(closes, 50),
                sma200: this.indicators.calculateSMA(closes, 200)
            },
            ema: {
                ema12: this.indicators.calculateEMA(closes, 12),
                ema26: this.indicators.calculateEMA(closes, 26)
            },
            macd: this.indicators.calculateMACD(closes),
            rsi: this.indicators.calculateRSI(closes, 14),
            bollingerBands: this.indicators.calculateBollingerBands(closes, 20, 2),
            fibonacci: this.indicators.calculateFibonacciLevels(highs, lows),
            volume: this.indicators.calculateVolumeProfile(data),
            supportResistance: this.indicators.findSupportResistance(highs, lows, closes)
        };
    }

    startDataSimulation() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        this.updateInterval = setInterval(() => {
            this.clients.forEach((client, clientId) => {
                client.subscriptions.forEach(key => {
                    const [symbol, timeframe] = key.split('_');
                    this.sendRealtimeUpdate(client.ws, symbol, timeframe);
                });
            });
        }, 1000);
    }

    sendRealtimeUpdate(ws, symbol, timeframe) {
        const update = this.generateRealtimeData(symbol);
        
        ws.send(JSON.stringify({
            type: 'realtime_update',
            symbol,
            timeframe,
            data: update
        }));
    }

    generateRealtimeData(symbol) {
        const basePrice = this.getBasePrice(symbol);
        const volatility = this.getVolatility(symbol);
        const change = (Math.random() - 0.5) * volatility;
        const price = basePrice + change;

        return {
            price,
            change,
            changePercent: (change / basePrice) * 100,
            volume: Math.random() * 10000,
            timestamp: Date.now()
        };
    }

    getBasePrice(symbol) {
        const prices = {
            'DANGCEM': 385.50,
            'MTNN': 235.00,
            'ZENITHBANK': 35.70,
            'GUARANTY': 44.20,
            'NB': 62.00,
            'UBA': 12.50,
            'USD/NGN': 1590.50,
            'EUR/NGN': 1720.80,
            'GBP/NGN': 2015.30,
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 150.75
        };
        return prices[symbol] || 100;
    }

    getVolatility(symbol) {
        return this.getBasePrice(symbol) * 0.002; // 0.2% volatility
    }

    getTimeframeSeconds(timeframe) {
        const map = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '30m': 1800,
            '1h': 3600,
            '4h': 14400,
            '1d': 86400,
            '1w': 604800
        };
        return map[timeframe] || 300;
    }

    generateClientId() {
        return \`client_\${Math.random().toString(36).substr(2, 9)}\`;
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
    }
}

module.exports = new ChartingService();`,

    'backend/services/socialTradingService.js': `const mongoose = require('mongoose');
const SocialPost = require('../models/SocialPost');
const TraderProfile = require('../models/TraderProfile');
const CopyTrade = require('../models/CopyTrade');

class SocialTradingService {
    async createPost(userId, postData) {
        try {
            const post = new SocialPost({
                userId,
                ...postData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await post.save();
            return await post.populate('userId', 'firstName lastName subscription').execPopulate();
        } catch (error) {
            throw new Error(\`Error creating post: \${error.message}\`);
        }
    }

    async getFeed(userId, options = {}) {
        try {
            const { page = 1, limit = 20, filter = 'all', sort = 'latest' } = options;
            
            let query = {};
            
            switch (filter) {
                case 'following':
                    const profile = await TraderProfile.findOne({ userId });
                    if (profile) {
                        query.userId = { \$in: profile.following };
                    }
                    break;
                case 'stocks':
                    query.tradeType = 'stock';
                    break;
                case 'forex':
                    query.tradeType = 'forex';
                    break;
            }

            const sortOptions = {
                latest: { createdAt: -1 },
                popular: { likes: -1 },
                trending: { likes: -1, comments: -1 }
            };

            const posts = await SocialPost.find(query)
                .populate('userId', 'firstName lastName subscription')
                .populate('comments.userId', 'firstName lastName')
                .sort(sortOptions[sort] || { createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return posts;
        } catch (error) {
            throw new Error(\`Error fetching feed: \${error.message}\`);
        }
    }

    async likePost(postId, userId) {
        try {
            const post = await SocialPost.findById(postId);
            if (!post) throw new Error('Post not found');

            const likeIndex = post.likes.indexOf(userId);
            if (likeIndex === -1) {
                post.likes.push(userId);
            } else {
                post.likes.splice(likeIndex, 1);
            }

            post.updatedAt = new Date();
            await post.save();
            return post;
        } catch (error) {
            throw new Error(\`Error liking post: \${error.message}\`);
        }
    }

    async commentOnPost(postId, userId, content) {
        try {
            const post = await SocialPost.findById(postId);
            if (!post) throw new Error('Post not found');

            post.comments.push({
                userId,
                content,
                createdAt: new Date()
            });

            post.updatedAt = new Date();
            await post.save();
            return await post.populate('comments.userId', 'firstName lastName').execPopulate();
        } catch (error) {
            throw new Error(\`Error commenting: \${error.message}\`);
        }
    }

    async createTraderProfile(userId, profileData) {
        try {
            let profile = await TraderProfile.findOne({ userId });
            
            if (profile) {
                Object.assign(profile, profileData, { updatedAt: new Date() });
            } else {
                profile = new TraderProfile({
                    userId,
                    ...profileData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            
            await profile.save();
            return profile;
        } catch (error) {
            throw new Error(\`Error creating trader profile: \${error.message}\`);
        }
    }

    async followTrader(userId, traderId) {
        try {
            const [userProfile, traderProfile] = await Promise.all([
                TraderProfile.findOne({ userId }),
                TraderProfile.findOne({ userId: traderId })
            ]);

            if (!traderProfile) throw new Error('Trader not found');

            if (!userProfile) {
                await this.createTraderProfile(userId, { following: [traderId] });
            } else {
                if (!userProfile.following.includes(traderId)) {
                    userProfile.following.push(traderId);
                    await userProfile.save();
                }
            }

            if (!traderProfile.followers.includes(userId)) {
                traderProfile.followers.push(userId);
                await traderProfile.save();
            }

            return { message: 'Successfully followed trader' };
        } catch (error) {
            throw new Error(\`Error following trader: \${error.message}\`);
        }
    }

    async unfollowTrader(userId, traderId) {
        try {
            const [userProfile, traderProfile] = await Promise.all([
                TraderProfile.findOne({ userId }),
                TraderProfile.findOne({ userId: traderId })
            ]);

            if (userProfile) {
                userProfile.following = userProfile.following.filter(
                    id => id.toString() !== traderId.toString()
                );
                await userProfile.save();
            }

            if (traderProfile) {
                traderProfile.followers = traderProfile.followers.filter(
                    id => id.toString() !== userId.toString()
                );
                await traderProfile.save();
            }

            return { message: 'Successfully unfollowed trader' };
        } catch (error) {
            throw new Error(\`Error unfollowing trader: \${error.message}\`);
        }
    }

    async setupCopyTrade(followerId, traderId, settings) {
        try {
            let copyTrade = await CopyTrade.findOne({ followerId, traderId });
            
            if (copyTrade) {
                Object.assign(copyTrade, settings);
            } else {
                copyTrade = new CopyTrade({
                    followerId,
                    traderId,
                    ...settings
                });
            }
            
            await copyTrade.save();
            return copyTrade;
        } catch (error) {
            throw new Error(\`Error setting up copy trade: \${error.message}\`);
        }
    }

    async getTopTraders(limit = 10) {
        try {
            const traders = await TraderProfile.find({})
                .populate('userId', 'firstName lastName email')
                .sort({ 'performance.monthly': -1, followers: -1 })
                .limit(limit)
                .lean();

            return traders.map(trader => ({
                ...trader,
                riskLevel: this.calculateRiskLevel(trader.risk),
                performance: this.calculatePerformanceMetrics(trader)
            }));
        } catch (error) {
            throw new Error(\`Error fetching top traders: \${error.message}\`);
        }
    }

    calculateRiskLevel(risk) {
        if (risk <= 3) return 'Low';
        if (risk <= 6) return 'Medium';
        return 'High';
    }

    calculatePerformanceMetrics(profile) {
        const winRate = profile.winRate || 0;
        return {
            rating: winRate >= 70 ? 'A' : winRate >= 50 ? 'B' : 'C',
            consistency: Math.min(100, winRate * 1.2),
            sharpeRatio: this.calculateSharpeRatio(profile)
        };
    }

    calculateSharpeRatio(profile) {
        const riskFreeRate = 0.02;
        const excessReturn = (profile.totalReturn / 100) - riskFreeRate;
        const volatility = profile.risk / 10;
        return volatility > 0 ? excessReturn / volatility : 0;
    }

    async getSentimentAnalysis(symbol) {
        try {
            const posts = await SocialPost.find({ symbol }).lean();
            
            const sentiments = posts.map(p => p.sentiment);
            const bullish = sentiments.filter(s => s === 'bullish').length;
            const bearish = sentiments.filter(s => s === 'bearish').length;
            const neutral = sentiments.filter(s => s === 'neutral').length;
            const total = sentiments.length || 1;

            return {
                symbol,
                bullishPercentage: (bullish / total) * 100,
                bearishPercentage: (bearish / total) * 100,
                neutralPercentage: (neutral / total) * 100,
                overallSentiment: bullish > bearish ? 'bullish' : 'bearish',
                postCount: total
            };
        } catch (error) {
            throw new Error(\`Error analyzing sentiment: \${error.message}\`);
        }
    }

    async updateTraderPerformance(userId, tradeResult) {
        try {
            const profile = await TraderProfile.findOne({ userId });
            if (!profile) return;

            profile.totalTrades += 1;
            if (tradeResult.profit > 0) {
                profile.successfulTrades += 1;
            }
            
            profile.winRate = (profile.successfulTrades / profile.totalTrades) * 100;
            profile.totalReturn += tradeResult.returnPercent || 0;
            
            // Update performance periods
            profile.performance.daily += tradeResult.profit || 0;
            profile.performance.weekly += tradeResult.profit || 0;
            profile.performance.monthly += tradeResult.profit || 0;
            profile.performance.yearly += tradeResult.profit || 0;

            await profile.save();
            return profile;
        } catch (error) {
            throw new Error(\`Error updating trader performance: \${error.message}\`);
        }
    }
}

module.exports = new SocialTradingService();`,

    'backend/services/notificationService.js': `const User = require('../models/User');

class NotificationService {
    constructor() {
        // Initialize notification service
        // In production, integrate with Firebase, OneSignal, etc.
        console.log('Notification service initialized');
    }

    async sendPushNotification(userId, notification) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.deviceToken) return;

            // In production, send push notification via FCM or APNS
            console.log(\`Sending push notification to user \${userId}:\`, notification);

            // Simulate sending notification
            return { success: true, message: 'Notification sent' };
        } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPriceAlert(userId, symbol, price, condition) {
        return await this.sendPushNotification(userId, {
            type: 'price_alert',
            title: \`Price Alert: \${symbol}\`,
            body: \`\${symbol} is now ₦\${price} (\${condition})\`,
            data: {
                symbol,
                price: price.toString(),
                condition,
                timestamp: new Date().toISOString()
            }
        });
    }

    async sendTradeSignal(userId, signal) {
        return await this.sendPushNotification(userId, {
            type: 'trade_signal',
            title: \`Trade Signal: \${signal.symbol}\`,
            body: \`\${signal.action.toUpperCase()} - Confidence: \${signal.confidence}%\`,
            data: {
                ...signal,
                timestamp: new Date().toISOString()
            }
        });
    }

    async sendSocialNotification(userId, notification) {
        return await this.sendPushNotification(userId, {
            type: 'social',
            ...notification
        });
    }

    async sendEmailNotification(userId, subject, body) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.email || !user.settings?.notifications?.email) return;

            // In production, integrate with email service (SendGrid, Mailgun, etc.)
            console.log(\`Sending email to \${user.email}: \${subject}\`);
            
            return { success: true, message: 'Email sent' };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendTradeConfirmation(userId, trade) {
        const subject = \`Trade Confirmation - \${trade.action.toUpperCase()} \${trade.symbol}\`;
        const body = \`
            Your \${trade.action} order for \${trade.quantity} shares of \${trade.symbol} 
            at ₦\${trade.price} has been \${trade.status}.
            Total: ₦\${trade.totalAmount}
        \`;

        await this.sendEmailNotification(userId, subject, body);
        await this.sendPushNotification(userId, {
            type: 'trade_confirmation',
            title: 'Trade Confirmed',
            body: \`\${trade.action.toUpperCase()} \${trade.quantity} \${trade.symbol} at ₦\${trade.price}\`,
            data: trade
        });
    }
}

module.exports = new NotificationService();`,

    // Backend - Routes
    'backend/routes/auth.js': `const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Register
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            phone,
            subscription: {
                type: 'free',
                isActive: true,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        user.lastLogin = new Date();
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', auth, [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updates = {};
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'settings'];
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Change password
router.put('/change-password', auth, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update device token for push notifications
router.put('/device-token', auth, async (req, res) => {
    try {
        const { deviceToken } = req.body;
        await User.findByIdAndUpdate(req.userId, { deviceToken });
        res.json({ message: 'Device token updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;`,

    'backend/routes/trading.js': `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trade = require('../models/Trade');
const User = require('../models/User');

// Get market overview
router.get('/market-overview', auth, async (req, res) => {
    try {
        const stocks = [
            { symbol: 'DANGCEM', name: 'Dangote Cement', price: 385.50 + (Math.random() - 0.5) * 10, change: (Math.random() - 0.5) * 5 },
            { symbol: 'MTNN', name: 'MTN Nigeria', price: 235.00 + (Math.random() - 0.5) * 5, change: (Math.random() - 0.5) * 3 },
            { symbol: 'ZENITHBANK', name: 'Zenith Bank', price: 35.70 + (Math.random() - 0.5) * 2, change: (Math.random() - 0.5) * 2 },
            { symbol: 'GUARANTY', name: 'GTBank', price: 44.20 + (Math.random() - 0.5) * 2, change: (Math.random() - 0.5) * 3 },
            { symbol: 'NB', name: 'Nigerian Breweries', price: 62.00 + (Math.random() - 0.5) * 3, change: (Math.random() - 0.5) * 2 },
            { symbol: 'UBA', name: 'United Bank for Africa', price: 12.50 + (Math.random() - 0.5), change: (Math.random() - 0.5) * 2 },
            { symbol: 'ACCESS', name: 'Access Bank', price: 9.80 + (Math.random() - 0.5), change: (Math.random() - 0.5) * 2 },
            { symbol: 'FBNH', name: 'FBN Holdings', price: 15.30 + (Math.random() - 0.5), change: (Math.random() - 0.5) * 2 }
        ];

        const forex = [
            { pair: 'USD/NGN', price: 1590.50 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 2 },
            { pair: 'EUR/NGN', price: 1720.80 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 2 },
            { pair: 'GBP/NGN', price: 2015.30 + (Math.random() - 0.5) * 25, change: (Math.random() - 0.5) * 2 },
            { pair: 'EUR/USD', price: 1.0850 + (Math.random() - 0.5) * 0.01, change: (Math.random() - 0.5) * 1 },
            { pair: 'GBP/USD', price: 1.2650 + (Math.random() - 0.5) * 0.01, change: (Math.random() - 0.5) * 1 },
            { pair: 'USD/JPY', price: 150.75 + (Math.random() - 0.5), change: (Math.random() - 0.5) * 1 }
        ];

        res.json({ stocks, forex });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Place order
router.post('/place-order', auth, async (req, res) => {
    try {
        const { type, symbol, quantity, orderType, action, limitPrice, stopPrice } = req.body;
        
        // Get current price (simulated)
        const currentPrice = this.getCurrentPrice(symbol, type);
        
        // Validate order
        if (orderType === 'market' && (!quantity || quantity <= 0)) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const totalAmount = quantity * currentPrice;
        
        // Check user balance for buy orders
        if (action === 'buy') {
            const user = await User.findById(req.userId);
            if (user.tradingBalance < totalAmount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            user.tradingBalance -= totalAmount;
            await user.save();
        }

        const trade = new Trade({
            userId: req.userId,
            tradeType: type,
            symbol,
            action,
            orderType,
            quantity,
            price: currentPrice,
            totalAmount,
            limitPrice,
            stopPrice,
            status: 'executed',
            executedAt: new Date(),
            fees: totalAmount * 0.001 // 0.1% fee
        });

        await trade.save();

        // Update portfolio
        if (action === 'buy') {
            const user = await User.findById(req.userId);
            const existingPosition = user.portfolio.find(
                p => p.symbol === symbol && p.type === type
            );

            if (existingPosition) {
                const totalQuantity = existingPosition.quantity + quantity;
                const totalInvested = existingPosition.totalInvested + totalAmount;
                existingPosition.quantity = totalQuantity;
                existingPosition.averagePrice = totalInvested / totalQuantity;
                existingPosition.totalInvested = totalInvested;
            } else {
                user.portfolio.push({
                    symbol,
                    type,
                    quantity,
                    averagePrice: currentPrice,
                    totalInvested: totalAmount
                });
            }

            await user.save();
        }

        res.json({
            message: 'Order executed successfully',
            trade
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user portfolio
router.get('/portfolio', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const portfolio = user.portfolio.map(position => {
            const currentPrice = this.getCurrentPrice(position.symbol, position.type);
            const marketValue = position.quantity * currentPrice;
            const profit = marketValue - position.totalInvested;
            const profitPercent = (profit / position.totalInvested) * 100;

            return {
                ...position.toObject(),
                currentPrice,
                marketValue,
                profit,
                profitPercent
            };
        });

        const totalValue = portfolio.reduce((sum, p) => sum + p.marketValue, 0) + user.tradingBalance;
        const totalProfit = portfolio.reduce((sum, p) => sum + p.profit, 0);

        res.json({
            portfolio,
            tradingBalance: user.tradingBalance,
            totalValue,
            totalProfit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get trade history
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const trades = await Trade.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Trade.countDocuments({ userId: req.userId });

        res.json({
            trades,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Watchlist management
router.post('/watchlist', auth, async (req, res) => {
    try {
        const { symbol, type } = req.body;
        const user = await User.findById(req.userId);

        const existing = user.watchlist.find(w => w.symbol === symbol && w.type === type);
        if (existing) {
            return res.status(400).json({ message: 'Already in watchlist' });
        }

        user.watchlist.push({ symbol, type });
        await user.save();

        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/watchlist/:symbol/:type', auth, async (req, res) => {
    try {
        const { symbol, type } = req.params;
        const user = await User.findById(req.userId);

        user.watchlist = user.watchlist.filter(
            w => !(w.symbol === symbol && w.type === type)
        );
        await user.save();

        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper method to get current price
getCurrentPrice = (symbol, type) => {
    const prices = {
        stocks: {
            'DANGCEM': 385.50,
            'MTNN': 235.00,
            'ZENITHBANK': 35.70,
            'GUARANTY': 44.20,
            'NB': 62.00,
            'UBA': 12.50,
            'ACCESS': 9.80,
            'FBNH': 15.30
        },
        forex: {
            'USD/NGN': 1590.50,
            'EUR/NGN': 1720.80,
            'GBP/NGN': 2015.30,
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 150.75
        }
    };

    const basePrice = type === 'stock' ? 
        prices.stocks[symbol] || 100 : 
        prices.forex[symbol] || 1;

    return basePrice + (Math.random() - 0.5) * basePrice * 0.02;
};

module.exports = router;`,

    // Continue with remaining routes...
    'backend/routes/predictions.js': `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionCheck = require('../middleware/subscriptionCheck');
const aiPredictor = require('../services/aiPredictor');

// Get single prediction
router.get('/:type/:symbol', auth, subscriptionCheck('premium'), async (req, res) => {
    try {
        const { type, symbol } = req.params;
        
        if (!['stock', 'forex'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Must be stock or forex' });
        }

        const prediction = await aiPredictor.predict(symbol, type);
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get batch predictions
router.post('/batch', auth, subscriptionCheck('pro'), async (req, res) => {
    try {
        const { stocks = [], forexPairs = [] } = req.body;
        const predictions = {
            stocks: {},
            forex: {}
        };
        
        for (const symbol of stocks) {
            predictions.stocks[symbol] = await aiPredictor.predict(symbol, 'stock');
        }
        
        for (const pair of forexPairs) {
            predictions.forex[pair] = await aiPredictor.predict(pair, 'forex');
        }
        
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Train model (admin only)
router.post('/train', auth, subscriptionCheck('pro'), async (req, res) => {
    try {
        const { symbol, type } = req.body;
        const result = await aiPredictor.trainModel(symbol, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;`,

    'backend/routes/subscriptions.js': `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get subscription plans
router.get('/plans', (req, res) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            duration: '30 days trial',
            features: [
                'Basic market data',
                'Limited predictions (5/day)',
                'Watchlist (up to 5 items)',
                'Basic charts'
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 5000,
            duration: 'Monthly',
            features: [
                'Advanced market data',
                'Unlimited predictions',
                'Real-time alerts',
                'Portfolio tracking',
                'Advanced charts with indicators',
                'Priority support',
                'Social trading features'
            ]
        },
        {
            id: 'pro',
            name: 'Professional',
            price: 15000,
            duration: 'Monthly',
            features: [
                'All Premium features',
                'API access',
                'Custom indicators',
                'Backtesting',
                'Dedicated account manager',
                'Copy trading',
                'Advanced analytics',
                'Priority execution'
            ]
        }
    ];
    
    res.json(plans);
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
    try {
        const { planId, duration = 1 } = req.body;
        const user = await User.findById(req.userId);
        
        const plans = {
            premium: 5000,
            pro: 15000
        };
        
        if (!plans[planId]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }
        
        const price = plans[planId] * duration;
        
        // In production, integrate with payment gateway (Paystack, Flutterwave)
        // For now, simulate payment
        
        user.subscription = {
            type: planId,
            startDate: new Date(),
            endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            autoRenew: false
        };
        
        await user.save();
        
        res.json({
            message: 'Subscription successful',
            subscription: user.subscription
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        user.subscription.isActive = false;
        user.subscription.endDate = new Date();
        user.subscription.autoRenew = false;
        
        await user.save();
        
        res.json({ message: 'Subscription cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current subscription
router.get('/current', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle auto-renew
router.post('/auto-renew', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.subscription.autoRenew = !user.subscription.autoRenew;
        await user.save();
        
        res.json({
            autoRenew: user.subscription.autoRenew,
            message: \`Auto-renewal \${user.subscription.autoRenew ? 'enabled' : 'disabled'}\`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;`,

    'backend/routes/social.js': `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const socialTradingService = require('../services/socialTradingService');

// Create post
router.post('/posts', auth, async (req, res) => {
    try {
        const post = await socialTradingService.createPost(req.userId, req.body);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get feed
router.get('/feed', auth, async (req, res) => {
    try {
        const posts = await socialTradingService.getFeed(req.userId, req.query);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/unlike post
router.post('/posts/:postId/like', auth, async (req, res) => {
    try {
        const post = await socialTradingService.likePost(req.params.postId, req.userId);
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Comment on post
router.post('/posts/:postId/comment', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await socialTradingService.commentOnPost(
            req.params.postId,
            req.userId,
            content
        );
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get trader profile
router.get('/trader/:traderId', auth, async (req, res) => {
    try {
        const TraderProfile = require('../models/TraderProfile');
        const profile = await TraderProfile.findOne({ userId: req.params.traderId })
            .populate('userId', 'firstName lastName email');
        
        if (!profile) {
            return res.status(404).json({ message: 'Trader profile not found' });
        }
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create/update trader profile
router.put('/trader/profile', auth, async (req, res) => {
    try {
        const profile = await socialTradingService.createTraderProfile(req.userId, req.body);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Follow trader
router.post('/follow/:traderId', auth, async (req, res) => {
    try {
        const result = await socialTradingService.followTrader(req.userId, req.params.traderId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unfollow trader
router.post('/unfollow/:traderId', auth, async (req, res) => {
    try {
        const result = await socialTradingService.unfollowTrader(req.userId, req.params.traderId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Setup copy trading
router.post('/copy-trade', auth, async (req, res) => {
    try {
        const { traderId, allocation, maxTradeSize, stopLoss } = req.body;
        const copyTrade = await socialTradingService.setupCopyTrade(
            req.userId,
            traderId,
            { allocation, maxTradeSize, stopLoss }
        );
        res.json(copyTrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get top traders
router.get('/top-traders', auth, async (req, res) => {
    try {
        const traders = await socialTradingService.getTopTraders();
        res.json(traders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sentiment analysis
router.get('/sentiment/:symbol', auth, async (req, res) => {
    try {
        const analysis = await socialTradingService.getSentimentAnalysis(req.params.symbol);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;`,

    'backend/routes/charts.js': `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chartingService = require('../services/chartingService');
const TechnicalIndicators = require('../services/technicalIndicators');

// Get historical data
router.get('/historical/:symbol', auth, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe = '1h', limit = 200 } = req.query;
        
        const data = await chartingService.getHistoricalData(symbol, timeframe, parseInt(limit));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get technical indicators
router.get('/indicators/:symbol', auth, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe = '1h' } = req.query;
        
        const data = await chartingService.getHistoricalData(symbol, timeframe, 200);
        const indicators = await chartingService.calculateAllIndicators(data);
        
        res.json(indicators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get support and resistance levels
router.get('/levels/:symbol', auth, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe = '1h' } = req.query;
        
        const data = await chartingService.getHistoricalData(symbol, timeframe, 200);
        const indicators = new TechnicalIndicators();
        const levels = indicators.findSupportResistance(
            data.map(d => d.high),
            data.map(d => d.low),
            data.map(d => d.close)
        );
        
        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;`,

    // Package.json files
    'package.json': `{
  "name": "ai-trading-app",
  "version": "1.0.0",
  "description": "AI-powered trading app for Nigerian Stock Exchange and Forex",
  "main": "backend/app.js",
  "scripts": {
    "start": "node backend/app.js",
    "server": "nodemon backend/app.js",
    "client": "cd frontend && npm start",
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "build": "cd frontend && npm run build",
    "install-all": "npm install && cd frontend && npm install",
    "test": "jest",
    "create-zip": "node create-project.js"
  },
  "dependencies": {
    "@tensorflow/tfjs-node": "^4.2.0",
    "archiver": "^5.3.1",
    "axios": "^1.6.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.6.3",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  },
  "keywords": ["trading", "ai", "nigerian-stock-exchange", "forex"],
  "author": "AI Trading App Team",
  "license": "MIT"
}`,

    'frontend/package.json': `{
  "name": "ai-trading-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.2",
    "lightweight-charts": "^4.1.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "recharts": "^2.10.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}`,

    'frontend/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2196F3" />
    <meta name="description" content="AI Trading App - Nigerian Stock Exchange and Forex Trading Platform" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    />
    <title>AI Trading App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

    // Environment files
    '.env': `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-trading-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Payment Gateway (Paystack/Flutterwave)
PAYMENT_GATEWAY=paystack
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key

# API Keys for Market Data
NSE_API_KEY=your-nse-api-key
FOREX_API_KEY=your-forex-api-key`,

    '.gitignore': `# Dependencies
node_modules/
frontend/node_modules/
mobile/node_modules/

# Environment variables
.env
.env.local
.env.production

# Build files
frontend/build/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Misc
.cache/
temp/
tmp/`,

    'README.md': `# AI Trading App

A comprehensive AI-powered trading application for the Nigerian Stock Exchange and Forex markets.

## Features

### Core Features
- 🤖 AI-powered buy/sell predictions using LSTM neural networks
- 📊 Real-time market data visualization with advanced charts
- 💹 Nigerian Stock Exchange (NSE) trading
- 💱 Major forex pairs trading including USD/NGN, EUR/NGN, GBP/NGN
- 📱 Mobile app support (React Native)
- 💬 Social trading platform
- 👥 Copy trading functionality
- 📈 Technical analysis with multiple indicators

### Subscription Tiers
- **Free**: Basic features with limited predictions
- **Premium** (₦5,000/month): Advanced features and unlimited predictions
- **Professional** (₦15,000/month): All features including API access

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- TensorFlow.js for AI predictions
- WebSocket for real-time data
- JWT authentication
- Firebase for push notifications

### Frontend
- React.js
- Lightweight Charts for advanced charting
- React Router for navigation
- Axios for API requests
- Recharts for data visualization

### Mobile
- React Native
- React Navigation
- React Native Paper UI components
- Push notifications support

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/ai-trading-app.git
cd ai-trading-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm run install-all
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start MongoDB:
\`\`\`bash
mongod
\`\`\`

5. Run the application:
\`\`\`bash
# Development mode (both backend and frontend)
npm run dev

# Production mode
npm start
\`\`\`

## Project Structure

\`\`\`
ai-trading-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/       # Auth and validation
│   └── app.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── styles/      # CSS styles
│   └── public/          # Static files
├── mobile/              # React Native app
├── docs/               # Documentation
└── package.json
\`\`\`

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Trading
- GET /api/trading/market-overview - Get market data
- POST /api/trading/place-order - Place trade order
- GET /api/trading/portfolio - Get user portfolio
- GET /api/trading/history - Get trade history

### Predictions
- GET /api/predictions/:type/:symbol - Get AI prediction
- POST /api/predictions/batch - Get multiple predictions

### Social
- GET /api/social/feed - Get social feed
- POST /api/social/posts - Create post
- POST /api/social/follow/:traderId - Follow trader
- POST /api/social/copy-trade - Setup copy trading

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@aitradingapp.com or join our Telegram group.

## Disclaimer

Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. The AI predictions are for informational purposes only and should not be considered as financial advice.`,

    'LICENSE': `MIT License

Copyright (c) 2024 AI Trading App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
};

// Create all files
const createFiles = () => {
    Object.entries(files).forEach(([filePath, content]) => {
        const fullPath = path.join(__dirname, filePath);
        fs.writeFileSync(fullPath, content);
        console.log(`Created: ${filePath}`);
    });
};

// Create zip archive
const createZipArchive = async () => {
    const output = fs.createWriteStream(path.join(__dirname, 'ai-trading-app.zip'));
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
        console.log(`\n✅ Archive created successfully!`);
        console.log(`📦 File size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📁 Location: ${path.join(__dirname, 'ai-trading-app.zip')}`);
        console.log(`\n📋 Total files: ${Object.keys(files).length}`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    // Add all files to archive
    Object.keys(files).forEach(filePath => {
        archive.append(files[filePath], { name: filePath });
    });

    await archive.finalize();
};

// Main execution
const main = async () => {
    console.log('🚀 Starting project bundling...\n');
    
    try {
        // Create directories
        createDirectories();
        console.log('📁 Directory structure created');
        
        // Create all files
        createFiles();
        console.log(`\n📝 Created ${Object.keys(files).length} files`);
        
        // Create zip archive
        await createZipArchive();
        
        console.log('\n✨ Project bundling complete!');
        console.log('\n📦 Download the zip file to get started');
        console.log('\n📚 Next steps:');
        console.log('1. Extract the zip file');
        console.log('2. Run: npm install');
        console.log('3. Set up your .env file');
        console.log('4. Run: npm run dev');
        console.log('\n🎯 Happy Trading!');
    } catch (error) {
        console.error('❌ Error creating project bundle:', error);
        process.exit(1);
    }
};

// Run the script
main();