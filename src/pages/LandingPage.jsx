import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Calendar, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        backgroundColor: 'var(--color-sidebar)',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '2.25rem',
            height: '2.25rem',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: 'var(--color-primary-dark)'
          }}>M</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>MedPoint Hospital</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn-secondary" style={{ border: 'none' }}>Sign In</Link>
          <Link to="/register" className="btn-primary">Book Appointment</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 3rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          Seamless Healthcare & Appointment Management
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
          Connect with expert doctors, schedule appointments in seconds, track real-time consultation queues, and access comprehensive medical records.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Get Started as Patient <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Hospital Portal Login
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
          <div className="card">
            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-subtle-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
              <Calendar size={24} />
            </div>
            <h3 className="card-title">Easy Online Booking</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Select department, pick your doctor, and choose available time slots with instant confirmation.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-subtle-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
              <Clock size={24} />
            </div>
            <h3 className="card-title">Live Queue Tracking</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No more waiting in crowded rooms. View your live token queue position right from your phone.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-subtle-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 className="card-title">Multi-Role Portal</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Tailored dashboards for Patients, Doctors, Receptionists, and Hospital Administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: 'var(--color-sidebar)', color: 'var(--color-sidebar-text)', padding: '2rem 3rem', textAlign: 'center', fontSize: '0.85rem' }}>
        MedPoint Hospital Appointment Management System &copy; {new Date().getFullYear()}. Built with Supabase & Node.js Native HTTP API.
      </footer>
    </div>
  );
}
