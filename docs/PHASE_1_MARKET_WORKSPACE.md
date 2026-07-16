# Phase 1: Market workspace

This version adds a multi-asset market workspace with:

- candlestick charts powered by Lightweight Charts;
- commodities, forex, crypto, indices and NGX asset coverage;
- interval switching (5m, 15m, 1h, 4h and 1d);
- AI-style technical signals with confidence, target and stop-loss levels;
- market overview and top-mover dashboard sections;
- simulated paper-order tickets.

## Important limitation

The included `marketDataService.js` is a deterministic demonstration engine. It does not provide exchange-grade live prices and does not execute real orders. Before production use, connect a licensed market-data vendor, validate the prediction model out of sample, and connect a regulated broker using server-side credentials.

## Run

Start MongoDB, then from the project root:

```powershell
npm install
cd frontend
npm install
cd ..
npm run dev
```
