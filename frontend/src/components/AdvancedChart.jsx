import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CandlestickChart from './CandlestickChart';
import { fetchCandles, fetchSignal } from '../services/marketApi';

const intervals = ['5m', '15m', '1h', '4h', '1d'];
const AdvancedChart = () => {
  const { symbol } = useParams();
  const decodedSymbol = decodeURIComponent(symbol || 'XAU/USD');
  const [interval, setInterval] = useState('1h');
  const [payload, setPayload] = useState(null);
  const [signal, setSignal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([fetchCandles(decodedSymbol, interval), fetchSignal(decodedSymbol, interval)])
      .then(([chartData, signalData]) => { if (active) { setPayload(chartData); setSignal(signalData); setError(''); } })
      .catch((err) => active && setError(err.response?.data?.message || 'Unable to load market data.'));
    return () => { active = false; };
  }, [decodedSymbol, interval]);

  return <div className="advanced-chart-page">
    <div className="page-header chart-page-header"><div><h1>{payload?.asset?.name || decodedSymbol}</h1><p>{decodedSymbol} · {payload?.asset?.category || 'Market'} · {payload?.asset?.source || 'Loading'}</p></div><Link className="btn btn-primary" to={`/trading?symbol=${encodeURIComponent(decodedSymbol)}`}>Trade asset</Link></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="chart-toolbar"><div>{intervals.map((item) => <button key={item} onClick={() => setInterval(item)} className={`btn btn-sm ${interval === item ? 'btn-primary' : 'btn-outline'}`}>{item}</button>)}</div><div className="quote-line"><strong>{payload?.asset?.price ?? '—'}</strong><span className={(payload?.asset?.change || 0) >= 0 ? 'positive' : 'negative'}>{payload?.asset?.change >= 0 ? '+' : ''}{payload?.asset?.change ?? 0}%</span></div></div>
    <div className="market-workspace"><div className="card chart-shell">{payload ? <CandlestickChart candles={payload.candles} /> : <div className="loading-panel">Loading candlesticks…</div>}</div><aside className="card signal-panel"><h3>AI signal</h3>{signal ? <><span className={`signal-action ${signal.action.toLowerCase()}`}>{signal.action}</span><div className="confidence-meter"><span style={{ width: `${signal.confidence}%` }} /></div><p><strong>{signal.confidence}% confidence</strong></p><dl><div><dt>Current</dt><dd>{signal.currentPrice}</dd></div><div><dt>Target</dt><dd>{signal.target}</dd></div><div><dt>Stop loss</dt><dd>{signal.stopLoss}</dd></div><div><dt>Horizon</dt><dd>{signal.horizon}</dd></div></dl><p className="signal-rationale">{signal.rationale}</p><small>{signal.model}. {signal.disclaimer}</small></> : <p>Calculating signal…</p>}</aside></div>
  </div>;
};
export default AdvancedChart;
