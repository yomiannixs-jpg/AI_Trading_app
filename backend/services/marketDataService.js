const crypto = require('crypto');

const ASSETS = [
  { symbol: 'XAU/USD', name: 'Gold', category: 'Commodities', currency: 'USD', basePrice: 3342.6, precision: 2 },
  { symbol: 'XAG/USD', name: 'Silver', category: 'Commodities', currency: 'USD', basePrice: 38.45, precision: 3 },
  { symbol: 'WTI/USD', name: 'WTI Crude Oil', category: 'Commodities', currency: 'USD', basePrice: 78.32, precision: 2 },
  { symbol: 'BRENT/USD', name: 'Brent Crude Oil', category: 'Commodities', currency: 'USD', basePrice: 81.14, precision: 2 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex', currency: 'USD', basePrice: 1.0864, precision: 5 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex', currency: 'USD', basePrice: 1.2941, precision: 5 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex', currency: 'JPY', basePrice: 149.82, precision: 3 },
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'Crypto', currency: 'USD', basePrice: 118420, precision: 2 },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'Crypto', currency: 'USD', basePrice: 3720, precision: 2 },
  { symbol: 'SPX', name: 'S&P 500', category: 'Indices', currency: 'USD', basePrice: 6268, precision: 2 },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'Indices', currency: 'USD', basePrice: 22935, precision: 2 },
  { symbol: 'DANGCEM', name: 'Dangote Cement', category: 'NGX Stocks', currency: 'NGN', basePrice: 385.5, precision: 2 },
  { symbol: 'MTNN', name: 'MTN Nigeria', category: 'NGX Stocks', currency: 'NGN', basePrice: 235, precision: 2 },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank', category: 'NGX Stocks', currency: 'NGN', basePrice: 35.2, precision: 2 }
];

const hashNumber = (text) => parseInt(crypto.createHash('sha256').update(text).digest('hex').slice(0, 8), 16);
const seededNoise = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

function getAsset(symbol) {
  const decoded = decodeURIComponent(symbol || '').toUpperCase();
  return ASSETS.find((asset) => asset.symbol === decoded) || ASSETS[0];
}

function currentQuote(asset, tick = Date.now()) {
  const minute = Math.floor(tick / 60000);
  const seed = hashNumber(asset.symbol);
  const drift = Math.sin((minute + seed) / 19) * 0.006;
  const pulse = seededNoise(minute + seed) * 0.0025;
  const price = asset.basePrice * (1 + drift + pulse);
  const previous = asset.basePrice * (1 + Math.sin((minute - 1440 + seed) / 19) * 0.006);
  const change = ((price - previous) / previous) * 100;
  return {
    ...asset,
    price: Number(price.toFixed(asset.precision)),
    change: Number(change.toFixed(2)),
    timestamp: new Date().toISOString(),
    source: process.env.MARKET_DATA_PROVIDER || 'demo-engine'
  };
}

function generateCandles(asset, interval = '1h', limit = 160) {
  const intervalSeconds = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 }[interval] || 3600;
  const end = Math.floor(Date.now() / 1000 / intervalSeconds) * intervalSeconds;
  const seed = hashNumber(asset.symbol + interval);
  let previousClose = asset.basePrice * (1 + seededNoise(seed) * 0.02);
  const volatility = asset.category === 'Crypto' ? 0.012 : asset.category === 'Forex' ? 0.0018 : 0.005;
  const candles = [];

  for (let i = limit - 1; i >= 0; i -= 1) {
    const time = end - i * intervalSeconds;
    const wave = Math.sin((limit - i + seed) / 13) * volatility * 0.45;
    const randomMove = seededNoise(seed + time) * volatility;
    const open = previousClose;
    const close = Math.max(0.00001, open * (1 + wave + randomMove));
    const range = Math.abs(seededNoise(seed + time + 17)) * volatility * 1.4;
    const high = Math.max(open, close) * (1 + range);
    const low = Math.min(open, close) * (1 - range);
    const volume = Math.round((100000 + Math.abs(seededNoise(seed + time + 31)) * 900000) * (asset.category === 'Crypto' ? 4 : 1));
    candles.push({
      time,
      open: Number(open.toFixed(asset.precision)),
      high: Number(high.toFixed(asset.precision)),
      low: Number(low.toFixed(asset.precision)),
      close: Number(close.toFixed(asset.precision)),
      volume
    });
    previousClose = close;
  }
  return candles;
}

function calculateSignal(asset, interval = '1h') {
  const candles = generateCandles(asset, interval, 90);
  const closes = candles.map((item) => item.close);
  const last = closes[closes.length - 1];
  const sma = (period) => closes.slice(-period).reduce((sum, value) => sum + value, 0) / period;
  const fast = sma(10);
  const slow = sma(30);
  const momentum = ((last - closes[closes.length - 8]) / closes[closes.length - 8]) * 100;
  const score = ((fast - slow) / slow) * 100 * 16 + momentum * 0.9;
  const action = score > 0.22 ? 'BUY' : score < -0.22 ? 'SELL' : 'HOLD';
  const confidence = Math.min(94, Math.max(55, Math.round(62 + Math.abs(score) * 9)));
  const riskDistance = asset.category === 'Crypto' ? 0.025 : asset.category === 'Forex' ? 0.006 : 0.015;
  const direction = action === 'SELL' ? -1 : 1;
  const target = action === 'HOLD' ? last : last * (1 + direction * riskDistance * 1.8);
  const stopLoss = action === 'HOLD' ? last * (1 - riskDistance) : last * (1 - direction * riskDistance);
  return {
    symbol: asset.symbol,
    name: asset.name,
    category: asset.category,
    action,
    confidence,
    currentPrice: last,
    target: Number(target.toFixed(asset.precision)),
    stopLoss: Number(stopLoss.toFixed(asset.precision)),
    horizon: interval === '1d' ? '1–5 days' : 'Next 4–24 hours',
    rationale: action === 'BUY'
      ? 'Short-term momentum is above the medium-term trend with positive price acceleration.'
      : action === 'SELL'
        ? 'Short-term momentum is below the medium-term trend with negative price acceleration.'
        : 'Momentum and trend measures are mixed; confirmation is required before entry.',
    model: 'Technical ensemble demo',
    generatedAt: new Date().toISOString(),
    disclaimer: 'Educational signal only. Not investment advice.'
  };
}

module.exports = {
  listAssets: () => ASSETS.map((asset) => currentQuote(asset)),
  getAsset,
  currentQuote,
  generateCandles,
  calculateSignal
};
