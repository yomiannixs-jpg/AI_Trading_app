# AI Trading App — Project Structure

```text
AI_Trading_App_Reorganized/
├── backend/
│   ├── app.js
│   ├── config/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── subscriptionCheck.js
│   ├── models/
│   │   ├── CopyTrade.js
│   │   ├── SocialPost.js
│   │   ├── Trade.js
│   │   ├── TraderProfile.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── charts.js
│   │   ├── predictions.js
│   │   ├── social.js
│   │   ├── subscriptions.js
│   │   └── trading.js
│   ├── services/
│   │   ├── aiPredictor.js
│   │   ├── chartingService.js
│   │   ├── notificationService.js
│   │   ├── socialTradingService.js
│   │   └── technicalIndicators.js
│   └── utils/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── AdvancedChart.jsx
│   │   │   └── SocialFeed.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Predictions.jsx
│   │   │   └── Trading.jsx
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── mobile/
│   ├── App.jsx
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── navigation/
│       ├── screens/
│       │   └── DashboardScreen.jsx
│       └── services/
├── docs/
│   ├── PROJECT_STRUCTURE.md
│   └── AUDIT_REPORT.md
├── tools/
│   └── create-project.js
├── .env
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```
