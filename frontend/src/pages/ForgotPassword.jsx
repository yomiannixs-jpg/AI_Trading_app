import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('If an account exists for this email, reset instructions have been sent.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to process the request right now.');
    } finally { setLoading(false); }
  };

  return <div className="auth-container"><div className="auth-card"><div className="auth-header"><h1>Reset password</h1><p>Enter your account email.</p></div>{message && <div className="alert alert-info">{message}</div>}<form className="auth-form" onSubmit={submit}><div className="form-group"><label htmlFor="email">Email</label><input id="email" className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button></form><div className="auth-footer"><Link to="/login">Back to sign in</Link></div></div></div>;
};
export default ForgotPassword;
