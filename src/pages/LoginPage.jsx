import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      redirectByRole(profile.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'DOCTOR':
        navigate('/doctor/dashboard');
        break;
      case 'RECEPTIONIST':
        navigate('/receptionist/dashboard');
        break;
      case 'PATIENT':
      default:
        navigate('/patient/dashboard');
        break;
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      const profile = await login(demoEmail, demoPass);
      redirectByRole(profile.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">M</div>
          <h2 className="auth-title">Hospital Portal</h2>
          <p className="auth-subtitle">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@hospital.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-account-pills">
          <div className="demo-accounts-title">Instant Demo Logins:</div>
          <div className="demo-btn-group">
            <button type="button" className="demo-chip" onClick={() => handleDemoLogin('admin@hospital.com', 'admin123')}>
              🛡️ Admin
            </button>
            <button type="button" className="demo-chip" onClick={() => handleDemoLogin('dr.chen@hospital.com', 'doc123')}>
              🩺 Doctor
            </button>
            <button type="button" className="demo-chip" onClick={() => handleDemoLogin('receptionist@hospital.com', 'rec123')}>
              📋 Receptionist
            </button>
            <button type="button" className="demo-chip" onClick={() => handleDemoLogin('john.smith@gmail.com', 'pat123')}>
              👤 Patient
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register as Patient</Link>
        </div>
      </div>
    </div>
  );
}
