import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { UserCheck, Users, Building2, Calendar, Activity } from 'lucide-react';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/analytics/dashboard?role=ADMIN');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <Navbar title="Hospital Admin Overview" subtitle="System-wide performance, department stats, and operations" />

      <div className="stats-grid">
        <StatCard label="Total Patients" value={stats?.totalPatients || 0} subtext="Registered patient files" />
        <StatCard label="Active Doctors" value={stats?.totalDoctors || 0} subtext="Staff specialists" />
        <StatCard label="Appointments Today" value={stats?.todayAppointments || 0} subtext="Daily booking volume" subtextColor="highlight" />
        <StatCard label="Total Lifetime Appointments" value={stats?.totalAppointments || 0} subtext="Historical visits" subtextColor="positive" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title">Doctor Management</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Add doctors, assign clinical departments, and configure consultation fees.
          </p>
          <Link to="/admin/doctors" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <UserCheck size={18} /> Manage Doctors
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Department Management</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Create new departments, update descriptions, and allocate hospital resources.
          </p>
          <Link to="/admin/departments" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Building2 size={18} /> Manage Departments
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Hospital Analytics</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            View status breakdowns, completed vs cancelled rates, and appointment trends.
          </p>
          <Link to="/admin/analytics" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <Activity size={18} /> Open Analytics Report
          </Link>
        </div>
      </div>
    </div>
  );
}
