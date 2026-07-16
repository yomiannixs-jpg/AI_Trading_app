import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAssets, fetchSignal } from '../services/marketApi';

const Trading = () => {
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'XAU/USD');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [signal, setSignal] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => { fetchAssets().then(setAssets); }, []);
  useEffect(() => { fetchSignal(symbol).then(setSignal).catch(() => setSignal(null)); }, [symbol]);
  const selected = useMemo(() => assets.find((item) => item.symbol === symbol), [assets, symbol]);
  const notional = Number(quantity || 0) * Number(selected?.price || 0);
  const submit = (e) => { e.preventDefault(); setMessage(`${side.toUpperCase()} paper order prepared: ${quantity} ${symbol} at approximately ${selected?.price}. No real order was sent.`); };
  return <div className="trading-page"><div className="page-header"><h1>Multi-asset trading workspace</h1><p>Review charts and prepare simulated orders across supported markets.</p></div>{message && <div className="alert alert-success">{message}</div>}
    <div className="trading-container"><form className="card trade-form" onSubmit={submit}><h3>Order ticket</h3><div className="form-group"><label>Asset</label><select className="form-control" value={symbol} onChange={(e) => setSymbol(e.target.value)}>{assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></div><div className="quote-ticket"><span>Market price</span><strong>{selected?.price ?? '—'}</strong><span className={(selected?.change || 0) >= 0 ? 'positive' : 'negative'}>{selected?.change ?? 0}%</span></div><div className="form-group"><label>Quantity</label><input className="form-control" type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div><div className="trade-buttons"><button type="button" className={`btn ${side === 'buy' ? 'btn-success' : 'btn-outline'}`} onClick={() => setSide('buy')}>Buy</button><button type="button" className={`btn ${side === 'sell' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setSide('sell')}>Sell</button></div><div className="trade-summary"><div><span>Estimated notional</span><strong>{notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Execution</span><strong>Paper trading</strong></div></div><button className="btn btn-primary btn-block">Review paper order</button></form>
      <div><div className="card trade-chart-prompt"><h3>{symbol} market workspace</h3><p>Open the full candlestick chart with interval controls and AI signal details.</p><Link className="btn btn-primary" to={`/chart/${encodeURIComponent(symbol)}`}>Open candlestick chart</Link></div><div className="card"><h3>AI trade context</h3>{signal ? <><span className={`signal-action ${signal.action.toLowerCase()}`}>{signal.action}</span><p><strong>{signal.confidence}% confidence</strong> · {signal.horizon}</p><p>{signal.rationale}</p><div className="trade-summary"><div><span>Target</span><strong>{signal.target}</strong></div><div><span>Stop loss</span><strong>{signal.stopLoss}</strong></div></div></> : <p>Loading signal…</p>}</div></div></div>
  </div>;
};
export default Trading;
