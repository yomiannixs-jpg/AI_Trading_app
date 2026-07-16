import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchOverview } from '../services/marketApi';

const money = (asset) => `${asset.currency === 'NGN' ? '₦' : asset.currency === 'USD' ? '$' : ''}${Number(asset.price).toLocaleString()}`;
const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({ assets: [], movers: [], signalCount: 0 });
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () => fetchOverview().then(setOverview).catch((err) => setError(err.response?.data?.message || 'Market feed unavailable'));
    load(); const timer = setInterval(load, 30000); return () => clearInterval(timer);
  }, []);
  return <div className="dashboard"><div className="dashboard-header"><div><h1>Welcome, {user.firstName || 'Trader'}</h1><p className="text-muted">Cross-market prices, AI signals and portfolio snapshot.</p></div><Link className="btn btn-success" to="/trading">Trade now</Link></div>
    {error && <div className="alert alert-warning">{error}</div>}
    <div className="stats-grid"><div className="stat-card"><div className="stat-content"><span className="stat-label">Balance</span><span className="stat-value">₦{Number(user.tradingBalance || 0).toLocaleString()}</span></div></div><div className="stat-card"><div className="stat-content"><span className="stat-label">Today P&amp;L</span><span className="stat-value positive">+₦25,430</span></div></div><div className="stat-card"><div className="stat-content"><span className="stat-label">Markets monitored</span><span className="stat-value">{overview.assets.length || '—'}</span></div></div><div className="stat-card"><div className="stat-content"><span className="stat-label">Active AI signals</span><span className="stat-value">{overview.signalCount || '—'}</span></div></div></div>
    <div className="grid-2col"><div className="card"><div className="card-header"><h3>Market overview</h3><Link to="/trading">View all</Link></div><div className="market-list">{overview.assets.slice(0, 7).map((asset) => <Link className="market-item" to={`/chart/${encodeURIComponent(asset.symbol)}`} key={asset.symbol}><div><span className="symbol">{asset.symbol}</span><span className="name">{asset.name}</span></div><div className="market-price"><span className="price">{money(asset)}</span><span className={asset.change >= 0 ? 'positive' : 'negative'}>{asset.change >= 0 ? '+' : ''}{asset.change}%</span></div></Link>)}</div></div>
    <div className="card"><div className="card-header"><h3>Top movers</h3><Link to="/predictions">Signals</Link></div><div className="market-list">{overview.movers.map((asset) => <Link className="market-item" to={`/chart/${encodeURIComponent(asset.symbol)}`} key={asset.symbol}><div><span className="symbol">{asset.symbol}</span><span className="name">{asset.category}</span></div><div className="market-price"><span className="price">{money(asset)}</span><span className={asset.change >= 0 ? 'positive' : 'negative'}>{asset.change >= 0 ? '+' : ''}{asset.change}%</span></div></Link>)}</div></div></div>
    <div className="alert alert-info">The current market engine supplies realistic demonstration data. Connect a licensed data vendor and broker before live deployment or real-money execution.</div>
  </div>;
};
export default Dashboard;
