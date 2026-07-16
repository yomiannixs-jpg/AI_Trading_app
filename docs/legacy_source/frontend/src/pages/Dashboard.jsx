import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [marketData, setMarketData] = useState({
        stocks: [],
        forex: [],
        portfolio: null
    });
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('1D');

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchMarketData = async () => {
        try {
            const response = await axios.get('/api/trading/market-overview', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMarketData(response.data);
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setLoading(false);
        }
    };

    const portfolioData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: user?.tradingBalance * (1 + Math.sin(i / 4) * 0.1 + Math.random() * 0.02)
    }));

    if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user?.firstName}! 👋</h1>
                    <p className="text-muted">Here's what's happening with your portfolio today.</p>
                </div>
                <div className="header-actions">
                    <Link to="/trading?action=buy" className="btn btn-success">
                        <i className="fas fa-shopping-cart"></i> Buy
                    </Link>
                    <Link to="/trading?action=sell" className="btn btn-danger">
                        <i className="fas fa-tag"></i> Sell
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
                        <i className="fas fa-wallet" style={{ color: '#2196F3' }}></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Balance</span>
                        <span className="stat-value">₦{user?.tradingBalance?.toFixed(2) || '0.00'}</span>
                        <span className="stat-change positive">+12.5%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
                        <i className="fas fa-chart-line" style={{ color: '#4CAF50' }}></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Today's P&L</span>
                        <span className="stat-value positive">+₦25,430.00</span>
                        <span className="stat-change positive">+3.2%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
                        <i className="fas fa-trophy" style={{ color: '#FF9800' }}></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Trades</span>
                        <span className="stat-value">47</span>
                        <span className="stat-change positive">85% win rate</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fce4ec' }}>
                        <i className="fas fa-robot" style={{ color: '#E91E63' }}></i>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">AI Signals</span>
                        <span className="stat-value">12</span>
                        <span className="stat-change">Today</span>
                    </div>
                </div>
            </div>

            {/* Portfolio Chart */}
            <div className="card chart-card">
                <div className="card-header">
                    <h3>Portfolio Performance</h3>
                    <div className="timeframe-selector">
                        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
                            <button
                                key={tf}
                                className={`btn btn-sm ${timeframe === tf ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setTimeframe(tf)}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={portfolioData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#2196F3" 
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Market Overview */}
            <div className="grid-2col">
                <div className="card">
                    <div className="card-header">
                        <h3>Nigerian Stocks</h3>
                        <Link to="/trading?type=stock" className="btn btn-sm btn-outline">View All</Link>
                    </div>
                    <div className="market-list">
                        {marketData.stocks?.slice(0, 5).map((stock, index) => (
                            <Link 
                                to={`/chart/${stock.symbol}`} 
                                key={index} 
                                className="market-item"
                            >
                                <div className="market-info">
                                    <div>
                                        <span className="symbol">{stock.symbol}</span>
                                        <span className="name">{stock.name}</span>
                                    </div>
                                    <div className="market-price">
                                        <span className="price">₦{stock.price?.toFixed(2)}</span>
                                        <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Forex Pairs</h3>
                        <Link to="/trading?type=forex" className="btn btn-sm btn-outline">View All</Link>
                    </div>
                    <div className="market-list">
                        {marketData.forex?.slice(0, 5).map((forex, index) => (
                            <Link 
                                to={`/chart/${forex.pair}`} 
                                key={index} 
                                className="market-item"
                            >
                                <div className="market-info">
                                    <div>
                                        <span className="symbol">{forex.pair}</span>
                                    </div>
                                    <div className="market-price">
                                        <span className="price">₦{forex.price?.toFixed(2)}</span>
                                        <span className={`change ${forex.change >= 0 ? 'positive' : 'negative'}`}>
                                            {forex.change >= 0 ? '+' : ''}{forex.change?.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="card">
                <div className="card-header">
                    <h3>🤖 AI Trading Recommendations</h3>
                    <Link to="/predictions" className="btn btn-sm btn-primary">Get More Signals</Link>
                </div>
                <div className="recommendations-grid">
                    <div className="recommendation-card buy">
                        <div className="rec-header">
                            <span className="action-badge buy">BUY</span>
                            <span className="confidence">85% Confidence</span>
                        </div>
                        <h4>DANGCEM</h4>
                        <p>Strong bullish pattern detected. Breaking resistance at ₦390.</p>
                        <div className="rec-details">
                            <span>Entry: ₦385.50</span>
                            <span>Target: ₦410.00</span>
                            <span>Stop: ₦375.00</span>
                        </div>
                    </div>

                    <div className="recommendation-card sell">
                        <div className="rec-header">
                            <span className="action-badge sell">SELL</span>
                            <span className="confidence">78% Confidence</span>
                        </div>
                        <h4>MTNN</h4>
                        <p>Bearish divergence on RSI. Consider taking profits.</p>
                        <div className="rec-details">
                            <span>Exit: ₦235.00</span>
                            <span>Target: ₦220.00</span>
                            <span>Stop: ₦242.00</span>
                        </div>
                    </div>

                    <div className="recommendation-card hold">
                        <div className="rec-header">
                            <span className="action-badge hold">HOLD</span>
                            <span className="confidence">65% Confidence</span>
                        </div>
                        <h4>ZENITHBANK</h4>
                        <p>Consolidating in range. Wait for breakout confirmation.</p>
                        <div className="rec-details">
                            <span>Range: ₦34-36</span>
                            <span>Resistance: ₦36.50</span>
                            <span>Support: ₦33.50</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                    {[
                        { action: 'Bought', symbol: 'DANGCEM', quantity: '100', price: '385.50', time: '2 mins ago' },
                        { action: 'Sold', symbol: 'MTNN', quantity: '50', price: '235.00', time: '1 hour ago' },
                        { action: 'AI Signal', symbol: 'ZENITHBANK', action: 'Buy', confidence: '85%', time: '3 hours ago' },
                        { action: 'Deposit', amount: '₦100,000', time: '1 day ago' }
                    ].map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">
                                <i className={`fas ${
                                    activity.action === 'Bought' ? 'fa-shopping-cart' :
                                    activity.action === 'Sold' ? 'fa-tag' :
                                    activity.action === 'Deposit' ? 'fa-arrow-down' :
                                    'fa-robot'
                                }`}></i>
                            </div>
                            <div className="activity-content">
                                <p>
                                    {activity.action} {activity.symbol && `${activity.quantity} shares of ${activity.symbol}`}
                                    {activity.amount && activity.amount}
                                    {activity.confidence && `(${activity.confidence} confidence)`}
                                </p>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;