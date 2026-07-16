const express = require('express');
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

module.exports = router;