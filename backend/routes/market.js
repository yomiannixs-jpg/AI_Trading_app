const express = require('express');
const auth = require('../middleware/auth');
const market = require('../services/marketDataService');

const router = express.Router();
router.use(auth);

router.get('/assets', (req, res) => {
  const category = req.query.category;
  const assets = market.listAssets();
  res.json(category ? assets.filter((asset) => asset.category === category) : assets);
});

router.get('/overview', (req, res) => {
  const assets = market.listAssets();
  res.json({
    assets: assets.slice(0, 10),
    movers: [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5),
    signalCount: assets.filter((asset) => market.calculateSignal(market.getAsset(asset.symbol)).action !== 'HOLD').length,
    generatedAt: new Date().toISOString()
  });
});

router.get('/candles/:symbol', (req, res) => {
  const asset = market.getAsset(req.params.symbol);
  const interval = req.query.interval || '1h';
  const limit = Math.min(500, Math.max(30, Number(req.query.limit) || 160));
  res.json({ asset: market.currentQuote(asset), interval, candles: market.generateCandles(asset, interval, limit) });
});

router.get('/signal/:symbol', (req, res) => {
  const asset = market.getAsset(req.params.symbol);
  res.json(market.calculateSignal(asset, req.query.interval || '1h'));
});

router.get('/signals', (req, res) => {
  const interval = req.query.interval || '1h';
  res.json(market.listAssets().map((asset) => market.calculateSignal(market.getAsset(asset.symbol), interval)));
});

module.exports = router;
