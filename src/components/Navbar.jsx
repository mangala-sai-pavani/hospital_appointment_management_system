import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Bell } from 'lucide-react';

export default function Navbar({ title, subtitle, actionButton }) {
  const { profile } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="header-bar">
      <div>
        <h1 className="page-title">{title || 'Hospital Overview'}</h1>
        <p className="page-subtitle">{subtitle || `Welcome back, ${profile?.name || 'User'}`}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text-main)',
          fontWeight: 600
        }}>
          <CalendarIcon size={16} color="var(--color-primary-dark)" />
          <span>{today}</span>
        </div>

        {actionButton}
      </div>
    </header>
  );
}
