const express = require('express');
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
const paymentRoutes = require('./routes/payments');
const marketRoutes = require('./routes/market');

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
app.use('/api/payments', paymentRoutes);
app.use('/api/market', marketRoutes);

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

// Serve the React build only in production.
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

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
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

module.exports = { app, server };