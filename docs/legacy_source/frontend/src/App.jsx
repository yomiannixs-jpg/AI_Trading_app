import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Predictions from './pages/Predictions';
import Subscription from './pages/Subscription';
import SocialFeed from './components/SocialFeed';
import AdvancedChart from './components/AdvancedChart';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/App.css';
import './styles/Navbar.css';
import './styles/Dashboard.css';
import './styles/Trading.css';
import './styles/Predictions.css';
import './styles/Subscription.css';
import './styles/SocialFeed.css';
import './styles/AdvancedChart.css';
import './styles/Portfolio.css';
import './styles/Profile.css';
import './styles/Auth.css';
import './styles/Admin.css';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="loading-spinner">Loading...</div>;
    
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="loading-spinner">Loading...</div>;
    
    return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            {/* Protected routes */}
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/trading" element={
                                <PrivateRoute>
                                    <Trading />
                                </PrivateRoute>
                            } />
                            <Route path="/predictions" element={
                                <PrivateRoute>
                                    <Predictions />
                                </PrivateRoute>
                            } />
                            <Route path="/subscription" element={
                                <PrivateRoute>
                                    <Subscription />
                                </PrivateRoute>
                            } />
                            <Route path="/social" element={
                                <PrivateRoute>
                                    <SocialFeed />
                                </PrivateRoute>
                            } />
                            <Route path="/chart/:symbol" element={
                                <PrivateRoute>
                                    <AdvancedChart />
                                </PrivateRoute>
                            } />
                            <Route path="/portfolio" element={
                                <PrivateRoute>
                                    <Portfolio />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                            
                            {/* Admin routes */}
                            <Route path="/admin" element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } />
                            
                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;