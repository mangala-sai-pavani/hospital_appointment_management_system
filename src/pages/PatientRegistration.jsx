import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { UserPlus, CheckCircle } from 'lucide-react';
import '../styles/forms.css';

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'PatientPassword123!',
    date_of_birth: '',
    gender: 'MALE',
    blood_group: 'O+',
    address: '',
    emergency_contact: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSubmitting(true);

    try {
      await api.post('/auth/register', formData);
      setSuccess(`Patient ${formData.name} successfully registered in database!`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'PatientPassword123!',
        date_of_birth: '',
        gender: 'MALE',
        blood_group: 'O+',
        address: '',
        emergency_contact: ''
      });
    } catch (err) {
      setError(err.message || 'Patient registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Navbar title="Front-Desk Patient Registration" subtitle="Register a new patient record into the system" />

      {success && (
        <div style={{ backgroundColor: '#e8f1f0', border: '1px solid var(--color-primary)', color: 'var(--color-primary-dark)', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={formData.date_of_birth}
              onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-select" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })}>
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
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-input"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Emergency Contact</label>
          <input
            type="text"
            className="form-input"
            value={formData.emergency_contact}
            onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
          <UserPlus size={18} /> {submitting ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
}
