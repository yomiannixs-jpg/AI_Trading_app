const express = require('express');
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

module.exports = router;