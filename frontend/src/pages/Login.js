import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Login = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();
  const submit = async (e) => { e.preventDefault(); setBusy(true); setError(''); try { await login(email, password); navigate('/dashboard'); } catch (err) { setError(err.response?.data?.message || err.message || 'Login failed'); } finally { setBusy(false); } };
  return <div className="auth-container"><div className="auth-card"><div className="auth-header"><h1>Welcome back</h1><p>Sign in to AITrade.</p></div>{error && <div className="alert alert-error">{error}</div>}<form className="auth-form" onSubmit={submit}><div className="form-group"><label>Email</label><input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="form-group"><label>Password</label><input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><div className="auth-footer"><Link to="/forgot-password">Forgot password?</Link><p>New here? <Link to="/register">Create account</Link></p></div></div></div>;
};
export default Login;
