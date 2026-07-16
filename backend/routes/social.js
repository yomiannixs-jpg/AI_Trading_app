const express = require('express');
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

module.exports = router;