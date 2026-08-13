import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const { profile } = useAuth();

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Navbar title="Doctor Profile" subtitle="Professional credential details" />

      <div className="card" style={{ backgroundColor: 'var(--color-sidebar)', color: '#ffffff', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--color-primary)', borderRadius: '50%', color: 'var(--color-primary-dark)', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.name ? profile.name.charAt(0) : 'D'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.name}</h2>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{profile?.email}</div>
            <span className="badge badge-confirmed" style={{ marginTop: '0.5rem' }}>DOCTOR</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Professional Overview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
          <div><strong>Role:</strong> Medical Specialist / Consultant</div>
          <div><strong>Hospital ID:</strong> {profile?.id}</div>
          <div><strong>Contact Email:</strong> {profile?.email}</div>
          <div><strong>Contact Phone:</strong> {profile?.phone || '+1-555-0201'}</div>
        </div>
      </div>
    </div>
  );
}
