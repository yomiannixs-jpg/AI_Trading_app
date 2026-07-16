import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Portfolio = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const response = await axios.get('/api/trading/portfolio', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPortfolio(response.data);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading portfolio...</div>;

    const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

    const pieData = portfolio?.portfolio?.map((item, index) => ({
        name: item.symbol,
        value: item.marketValue
    })) || [];

    return (
        <div className="portfolio-page">
            <div className="page-header">
                <h1>My Portfolio</h1>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <i className="fas fa-plus"></i> Add Funds
                    </button>
                    <button className="btn btn-outline">
                        <i className="fas fa-download"></i> Export
                    </button>
                </div>
            </div>

            {/* Portfolio Overview */}
            <div className="portfolio-overview card">
                <div className="overview-grid">
                    <div className="overview-item">
                        <span className="label">Total Value</span>
                        <span className="value">₦{portfolio?.totalValue?.toLocaleString()}</span>
                    </div>
                    <div className="overview-item">
                        <span className="label">Total Profit/Loss</span>
                        <span className={`value ${portfolio?.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                            {portfolio?.totalProfit >= 0 ? '+' : ''}₦{portfolio?.totalProfit?.toLocaleString()}
                        </span>
                    </div>
                    <div className="overview-item">
                        <span className="label">Available Balance</span>
                        <span className="value">₦{portfolio?.tradingBalance?.toLocaleString()}</span>
                    </div>
                    <div className="overview-item">
                        <span className="label">Invested</span>
                        <span className="value">₦{(portfolio?.totalValue - portfolio?.tradingBalance)?.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Portfolio Distribution Chart */}
            <div className="grid-2col">
                <div className="card">
                    <h3>Portfolio Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3>Holdings</h3>
                    <div className="holdings-list">
                        {portfolio?.portfolio?.map((holding, index) => (
                            <div key={index} className="holding-item">
                                <div className="holding-info">
                                    <div className="holding-symbol">{holding.symbol}</div>
                                    <div className="holding-type">{holding.type}</div>
                                </div>
                                <div className="holding-details">
                                    <div className="detail-row">
                                        <span>Quantity:</span>
                                        <span>{holding.quantity}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Avg Price:</span>
                                        <span>₦{holding.averagePrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Current:</span>
                                        <span>₦{holding.currentPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>P&L:</span>
                                        <span className={holding.profit >= 0 ? 'positive' : 'negative'}>
                                            ₦{holding.profit?.toFixed(2)} ({holding.profitPercent?.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trade History */}
            <div className="card">
                <h3>Trade History</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Symbol</th>
                                <th>Type</th>
                                <th>Action</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { date: '2024-01-15', symbol: 'DANGCEM', type: 'Stock', action: 'Buy', quantity: 100, price: 385.50, total: 38550, status: 'Executed' },
                                { date: '2024-01-14', symbol: 'MTNN', type: 'Stock', action: 'Sell', quantity: 50, price: 235.00, total: 11750, status: 'Executed' },
                                { date: '2024-01-13', symbol: 'USD/NGN', type: 'Forex', action: 'Buy', quantity: 1000, price: 1590.50, total: 1590500, status: 'Executed' },
                            ].map((trade, index) => (
                                <tr key={index}>
                                    <td>{trade.date}</td>
                                    <td>{trade.symbol}</td>
                                    <td>{trade.type}</td>
                                    <td>
                                        <span className={`badge ${trade.action.toLowerCase()}`}>
                                            {trade.action}
                                        </span>
                                    </td>
                                    <td>{trade.quantity}</td>
                                    <td>₦{trade.price.toFixed(2)}</td>
                                    <td>₦{trade.total.toLocaleString()}</td>
                                    <td>
                                        <span className="badge success">{trade.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;