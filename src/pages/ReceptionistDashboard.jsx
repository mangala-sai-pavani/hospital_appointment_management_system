import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { UserPlus, Calendar, Search, Clock } from 'lucide-react';
import '../styles/dashboard.css';

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/analytics/dashboard?role=RECEPTIONIST');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <Navbar title="Receptionist Dashboard" subtitle="Front-desk patient check-in & scheduling" />

      <div className="stats-grid">
        <StatCard label="Today's Appointments" value={stats?.todayAppointments || 0} subtext="Scheduled visits" />
        <StatCard label="Pending Confirmations" value={stats?.pendingAppointments || 0} subtext="Awaiting desk review" subtextColor="highlight" />
        <StatCard label="Total Registered Patients" value={stats?.totalPatients || 0} subtext="Hospital database" />
        <StatCard label="Active On-Call Doctors" value={stats?.totalDoctors || 0} subtext="Available specialists" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="card">
          <h3 className="card-title">Patient Onboarding</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Register new walk-in patients and issue medical profiles.
          </p>
          <Link to="/receptionist/patient-register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <UserPlus size={18} /> Register Walk-In Patient
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Book Walk-In Appointment</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Schedule appointment slots for patients at the front desk.
          </p>
          <Link to="/receptionist/book-appointment" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Calendar size={18} /> Schedule Appointment
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Live Queue Control</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Manage token queues, check-in patients, and call tokens.
          </p>
          <Link to="/receptionist/queue" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <Clock size={18} /> Manage Token Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
