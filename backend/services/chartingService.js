const WebSocket = require('ws');
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
            
            console.log(`Client ${clientId} connected`);
            
            ws.on('message', (message) => this.handleMessage(clientId, message));
            ws.on('close', () => {
                console.log(`Client ${clientId} disconnected`);
                this.clients.delete(clientId);
            });
            ws.on('error', (error) => {
                console.error(`Client ${clientId} error:`, error);
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
        
        const key = `${symbol}_${timeframe}`;
        
        if (!client.subscriptions.has(key)) {
            client.subscriptions.add(key);
            this.sendInitialData(client.ws, symbol, timeframe);
        }
    }

    handleUnsubscription(client, data) {
        const { symbol, timeframe } = data;
        const key = `${symbol}_${timeframe}`;
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
        return `client_${Math.random().toString(36).substr(2, 9)}`;
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

module.exports = new ChartingService();