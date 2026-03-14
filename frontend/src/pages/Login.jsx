import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent'); // Default to parent
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotTab, setForgotTab] = useState('username');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password, role);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (newRole) => {
    setRole(newRole);
    setError('');
  };

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <div className="topbar">
        <div className="brand">
          <img src={logo} alt="Otomatiks Logo" className="logo-img" />
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h1>

        {/* Bubble Toggle Switch */}
        <div className="login-toggle-wrapper">
          <div className="login-toggle" onClick={() => toggleRole(role === 'parent' ? 'staff' : 'parent')}>
            <div
              className="toggle-bubble"
              style={{
                transform: role === 'parent' ? 'translateX(0)' : 'translateX(100%)'
              }}
            ></div>
            <span className={`toggle-option ${role === 'parent' ? 'active' : ''}`}>Parent</span>
            <span className={`toggle-option ${role !== 'parent' ? 'active' : ''}`}>Staff</span>
          </div>
        </div>

        <hr />

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>User Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'parent' ? 'Student name' : 'admin'}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>
              Forgot username or password?
            </a>
          </div>

          <div className="actions" style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal" onClick={() => setShowForgot(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Recover Account</h2>
              <button className="btn ghost" onClick={() => setShowForgot(false)} style={{ padding: '4px 8px', fontSize: '20px' }}>&times;</button>
            </div>

            <div className="forgot-tabs">
              <button className={`forgot-tab ${forgotTab === 'username' ? 'active' : ''}`} onClick={() => setForgotTab('username')}>Forgot Username</button>
              <button className={`forgot-tab ${forgotTab === 'password' ? 'active' : ''}`} onClick={() => setForgotTab('password')}>Forgot Password</button>
            </div>

            {forgotTab === 'username' ? (
              <div className="forgot-form">
                <p className="muted">Enter your registered email to recover your username:</p>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" />
                </div>
                <div className="actions" style={{ marginTop: '16px' }}>
                  <button className="btn" onClick={() => alert('Recovery email sent!')}>Recover Username</button>
                </div>
              </div>
            ) : (
              <div className="forgot-form">
                <p className="muted">Enter your username/email to reset your password:</p>
                <div className="field">
                  <label>Username / Email</label>
                  <input type="text" placeholder="Enter username or email" />
                </div>
                <div className="actions" style={{ marginTop: '16px' }}>
                  <button className="btn" onClick={() => alert('Password reset link sent!')}>Reset Password</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
