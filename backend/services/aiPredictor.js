const TechnicalIndicators = require('./technicalIndicators');

class AIPredictor {
  constructor() { this.indicators = new TechnicalIndicators(); }

  getBasePrice(symbol, type) {
    const stocks = { DANGCEM: 385.5, MTNN: 235, ZENITHBANK: 35.7, GUARANTY: 44.2, NB: 62, UBA: 12.5, ACCESS: 9.8, FBNH: 15.3 };
    const forex = { 'USD/NGN': 1590.5, 'EUR/NGN': 1720.8, 'GBP/NGN': 2015.3, 'USD/JPY': 150.75, 'EUR/USD': 1.085, 'GBP/USD': 1.265 };
    return type === 'stock' ? (stocks[symbol] || 100) : (forex[symbol] || 1);
  }

  async fetchMarketData(symbol, type = 'stock') {
    const data = [];
    let price = this.getBasePrice(symbol, type);
    const volatility = price * (type === 'stock' ? 0.015 : 0.004);
    for (let i = 0; i < 200; i += 1) {
      const open = price;
      const drift = (Math.random() - 0.48) * volatility;
      const close = Math.max(0.0001, open + drift);
      const high = Math.max(open, close) + Math.random() * volatility * 0.4;
      const low = Math.min(open, close) - Math.random() * volatility * 0.4;
      data.push({ open, high, low, close, volume: Math.round(10000 + Math.random() * 990000) });
      price = close;
    }
    return data;
  }

  calculateVolatility(data) {
    const returns = data.slice(1).map((row, i) => (row.close - data[i].close) / data[i].close);
    const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const variance = returns.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252);
  }

  async predict(symbol, type = 'stock') {
    const data = await this.fetchMarketData(symbol, type);
    const closes = data.map((row) => row.close);
    const currentPrice = closes[closes.length - 1];
    const recent = closes.slice(-20);
    const shortAverage = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const longAverage = recent.reduce((a, b) => a + b, 0) / recent.length;
    const momentum = (shortAverage - longAverage) / longAverage;
    const predictedPrice = currentPrice * (1 + momentum);
    const percentChange = ((predictedPrice - currentPrice) / currentPrice) * 100;
    const action = percentChange > 0.5 ? 'BUY' : percentChange < -0.5 ? 'SELL' : 'HOLD';
    const rsiRows = this.indicators.calculateRSI(closes, 14);
    const rsi = rsiRows.length ? rsiRows[rsiRows.length - 1].value : 50;
    return {
      symbol, type, currentPrice, predictedPrice, percentChange, action,
      confidence: Math.min(95, 55 + Math.abs(percentChange) * 8),
      technicalSignals: { rsi, rsiSignal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral', volatility: this.calculateVolatility(data) },
      model: 'lightweight-momentum-demo', timestamp: new Date()
    };
  }

  async trainModel(symbol, type = 'stock') {
    return { message: 'The lightweight demo predictor does not require model training.', symbol, type };
  }
}

module.exports = new AIPredictor();
