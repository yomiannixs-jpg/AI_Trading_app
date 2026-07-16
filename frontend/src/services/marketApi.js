import axios from 'axios';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
export const fetchAssets = async () => (await axios.get('/api/market/assets', { headers: authHeaders() })).data;
export const fetchOverview = async () => (await axios.get('/api/market/overview', { headers: authHeaders() })).data;
export const fetchCandles = async (symbol, interval = '1h', limit = 160) => (
  await axios.get(`/api/market/candles/${encodeURIComponent(symbol)}`, { params: { interval, limit }, headers: authHeaders() })
).data;
export const fetchSignal = async (symbol, interval = '1h') => (
  await axios.get(`/api/market/signal/${encodeURIComponent(symbol)}`, { params: { interval }, headers: authHeaders() })
).data;
export const fetchSignals = async (interval = '1h') => (
  await axios.get('/api/market/signals', { params: { interval }, headers: authHeaders() })
).data;
