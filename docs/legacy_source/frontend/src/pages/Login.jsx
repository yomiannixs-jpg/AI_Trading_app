import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your trading account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-icon">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-icon">
                            <i className="fas fa-lock"></i>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="button-loader">
                                <i className="fas fa-spinner fa-spin"></i> Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn btn-google">
                            <i className="fab fa-google"></i> Continue with Google
                        </button>
                        <button type="button" className="btn btn-apple">
                            <i className="fab fa-apple"></i> Continue with Apple
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register">Create Account</Link>
                    </p>
                </div>
            </div>

            <div className="auth-sidebar">
                <div className="auth-sidebar-content">
                    <h2>AI-Powered Trading</h2>
                    <div className="feature-list">
                        <div className="feature-item">
                            <i className="fas fa-robot"></i>
                            <div>
                                <h4>Smart Predictions</h4>
                                <p>AI-driven market analysis for better trading decisions</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-chart-line"></i>
                            <div>
                                <h4>Real-time Analytics</h4>
                                <p>Advanced charts and technical indicators</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-users"></i>
                            <div>
                                <h4>Social Trading</h4>
                                <p>Follow and copy successful traders</p>
                            </div>
                        </div>
                    </div>
                    <div className="market-stats">
                        <div className="stat-item">
                            <span className="stat-label">Active Traders</span>
                            <span className="stat-value">10,000+</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Success Rate</span>
                            <span className="stat-value">85%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Daily Volume</span>
                            <span className="stat-value">₦500M+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;