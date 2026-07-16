import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SocialFeed from './components/SocialFeed';
import AdvancedChart from './components/AdvancedChart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Predictions from './pages/Predictions';
import Subscription from './pages/Subscription';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './styles/index.css';
import './styles/App.css';
import './styles/Navbar.css';
import './styles/Auth.css';
import './styles/Dashboard.css';
import './styles/Trading.css';
import './styles/Predictions.css';
import './styles/Subscription.css';
import './styles/SocialFeed.css';
import './styles/AdvancedChart.css';
import './styles/Portfolio.css';
import './styles/Profile.css';
import './styles/Admin.css';

const Protected = ({ children, admin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const Shell = () => {
  const { user } = useAuth();
  return <div className="app"><Navbar /><main className={user ? 'main-content' : 'main-content public-content'}><Routes>
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
    <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/trading" element={<Protected><Trading /></Protected>} />
    <Route path="/predictions" element={<Protected><Predictions /></Protected>} />
    <Route path="/subscription" element={<Protected><Subscription /></Protected>} />
    <Route path="/social" element={<Protected><SocialFeed /></Protected>} />
    <Route path="/chart/:symbol" element={<Protected><AdvancedChart /></Protected>} />
    <Route path="/portfolio" element={<Protected><Portfolio /></Protected>} />
    <Route path="/profile" element={<Protected><Profile /></Protected>} />
    <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
    <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
  </Routes></main></div>;
};

const App = () => <AuthProvider><BrowserRouter><Shell /></BrowserRouter></AuthProvider>;
export default App;
