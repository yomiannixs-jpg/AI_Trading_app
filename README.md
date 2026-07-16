# AI Trading App

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
```bash
git clone https://github.com/yourusername/ai-trading-app.git
cd ai-trading-app
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
mongod
```

5. Run the application:
```bash
# Development mode (both backend and frontend)
npm run dev

# Production mode
npm start
```

## Project Structure

```
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
```

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

Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. The AI predictions are for informational purposes only and should not be considered as financial advice.