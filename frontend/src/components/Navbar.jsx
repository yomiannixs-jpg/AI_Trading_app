import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = [
    ['/dashboard', 'fa-th-large', 'Dashboard'],
    ['/trading', 'fa-chart-line', 'Trading'],
    ['/predictions', 'fa-robot', 'AI Predictions'],
    ['/portfolio', 'fa-briefcase', 'Portfolio'],
    ['/social', 'fa-users', 'Social Feed'],
    ['/subscription', 'fa-crown', 'Subscription'],
    ['/profile', 'fa-user-cog', 'Profile']
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen((open) => !open)} aria-label="Toggle navigation">
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
      <nav className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-brand"><i className="fas fa-robot" /><div><h2>AITrade</h2><small>Nigerian Markets</small></div></div>
        <ul className="nav-menu">
          {items.map(([path, icon, label]) => (
            <li className="nav-item" key={path}>
              <Link className={`nav-link ${location.pathname.startsWith(path) ? 'active' : ''}`} to={path} onClick={() => setIsOpen(false)}>
                <i className={`fas ${icon}`} /><span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {user.role === 'admin' && <Link className="nav-link" to="/admin"><i className="fas fa-shield-alt" /><span>Admin Panel</span></Link>}
        <div className="nav-footer">
          <div className="user-info"><div className="user-avatar">{user.firstName?.[0] || 'U'}</div><div className="user-details"><span className="user-name">{user.firstName} {user.lastName}</span><span className="user-plan">{user.subscription?.type || 'free'} plan</span></div></div>
          <button className="logout-btn" onClick={handleLogout}><i className="fas fa-sign-out-alt" /> Logout</button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
