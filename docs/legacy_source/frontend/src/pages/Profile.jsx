import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        tradingStyle: '',
        riskLevel: 'medium',
        notifications: {
            email: true,
            push: true,
            priceAlerts: false
        }
    });
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await updateProfile(formData);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error updating profile: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'fa-user' },
        { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
        { id: 'trading', label: 'Trading Preferences', icon: 'fa-chart-line' },
        { id: 'api', label: 'API Keys', icon: 'fa-key' }
    ];

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>Profile Settings</h1>
            </div>

            <div className="profile-layout">
                <div className="profile-sidebar">
                    <div className="user-avatar">
                        <div className="avatar-circle">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <h3>{user?.firstName} {user?.lastName}</h3>
                        <span className={`badge ${user?.subscription?.type}`}>
                            {user?.subscription?.type} Plan
                        </span>
                    </div>

                    <nav className="profile-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas ${tab.icon}`}></i>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="profile-content">
                    {message && (
                        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                            {message}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <form onSubmit={handleSubmit} className="card">
                            <h3>Personal Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <h3>Security Settings</h3>
                            
                            <div className="security-section">
                                <h4>Change Password</h4>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" className="form-control" />
                                </div>
                                <button className="btn btn-primary">Update Password</button>
                            </div>

                            <div className="security-section">
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account</p>
                                <button className="btn btn-outline">Enable 2FA</button>
                            </div>

                            <div className="security-section">
                                <h4>Active Sessions</h4>
                                <div className="session-item">
                                    <div>
                                        <strong>Current Session</strong>
                                        <p>Lagos, Nigeria • Chrome • Last active: Now</p>
                                    </div>
                                    <button className="btn btn-sm btn-danger">Logout</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card">
                            <h3>Notification Preferences</h3>
                            
                            <div className="notification-settings">
                                <div className="setting-item">
                                    <div>
                                        <h4>Email Notifications</h4>
                                        <p>Receive trade confirmations and alerts via email</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="notifications.email"
                                            checked={formData.notifications.email}
                                            onChange={handleChange}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <h4>Push Notifications</h4>
                                        <p>Get real-time alerts on your device</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="notifications.push"
                                            checked={formData.notifications.push}
                                            onChange={handleChange}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <h4>Price Alerts</h4>
                                        <p>Get notified when prices reach your targets</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="notifications.priceAlerts"
                                            checked={formData.notifications.priceAlerts}
                                            onChange={handleChange}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trading' && (
                        <div className="card">
                            <h3>Trading Preferences</h3>
                            
                            <div className="form-group">
                                <label>Trading Style</label>
                                <select
                                    name="tradingStyle"
                                    value={formData.tradingStyle}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="">Select Style</option>
                                    <option value="day-trader">Day Trader</option>
                                    <option value="swing-trader">Swing Trader</option>
                                    <option value="position-trader">Position Trader</option>
                                    <option value="scalper">Scalper</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Risk Level</label>
                                <select
                                    name="riskLevel"
                                    value={formData.riskLevel}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Default Trade Size (₦)</label>
                                <input
                                    type="number"
                                    name="defaultTradeSize"
                                    className="form-control"
                                    placeholder="10000"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="card">
                            <h3>API Keys</h3>
                            <p>Generate API keys for algorithmic trading and integration</p>
                            
                            {user?.subscription?.type === 'pro' ? (
                                <>
                                    <div className="api-key-item">
                                        <div>
                                            <strong>Production Key</strong>
                                            <p>Created: Never</p>
                                        </div>
                                        <button className="btn btn-primary btn-sm">Generate Key</button>
                                    </div>
                                    <div className="api-key-item">
                                        <div>
                                            <strong>Test Key</strong>
                                            <p>Created: Never</p>
                                        </div>
                                        <button className="btn btn-outline btn-sm">Generate Key</button>
                                    </div>
                                </>
                            ) : (
                                <div className="upgrade-prompt">
                                    <i className="fas fa-lock"></i>
                                    <p>API access is available on the Professional plan</p>
                                    <a href="/subscription" className="btn btn-primary">Upgrade to Pro</a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;