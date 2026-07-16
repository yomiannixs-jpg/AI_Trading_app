const express = require('express');
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

module.exports = router;