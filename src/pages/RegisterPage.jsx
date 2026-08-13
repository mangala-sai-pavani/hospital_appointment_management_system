import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import '../styles/auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: 'MALE',
    blood_group: 'O+',
    address: '',
    emergency_contact: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleBlur = (field) => {
    let err = '';
    if (field === 'name') err = validateName(formData.name, 'Full Name');
    else if (field === 'email') err = validateEmail(formData.email);
    else if (field === 'phone' && formData.phone) err = validatePhone(formData.phone);
    else if (field === 'password') {
      if (!formData.password || formData.password.length < 6) err = 'Password must be at least 6 characters long';
    }

    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run full validation
    const nameErr = validateName(formData.name, 'Full Name');
    const emailErr = validateEmail(formData.email);
    const phoneErr = formData.phone ? validatePhone(formData.phone) : '';
    const passErr = (!formData.password || formData.password.length < 6) ? 'Password must be at least 6 characters long' : '';

    const errors = { name: nameErr, email: emailErr, phone: phoneErr, password: passErr };
    setFieldErrors(errors);

    if (nameErr || emailErr || phoneErr || passErr) {
      setError('Please resolve all validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      await register({ ...formData, role: 'PATIENT' }); // Role explicitly locked to PATIENT
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="auth-logo-badge">M</div>
          <h2 className="auth-title">Patient Registration</h2>
          <p className="auth-subtitle">Create your personal healthcare account</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${fieldErrors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="Jane Doe"
                required
              />
              {fieldErrors.name && <div className="form-error-msg" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{fieldErrors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="jane@example.com"
                required
              />
              {fieldErrors.email && <div className="form-error-msg" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{fieldErrors.email}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && <div className="form-error-msg" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{fieldErrors.password}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className={`form-input ${fieldErrors.phone ? 'is-invalid' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="9876543210"
                required
              />
              {fieldErrors.phone && <div className="form-error-msg" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{fieldErrors.phone}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                className="form-input"
                max={new Date().toISOString().split('T')[0]}
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="blood_group" className="form-select" value={formData.blood_group} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, city, state"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact (Name & Phone)</label>
            <input
              type="text"
              name="emergency_contact"
              className="form-input"
              value={formData.emergency_contact}
              onChange={handleChange}
              placeholder="Spouse/Parent Name - 9876543210"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
