import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Users, CheckCircle } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/tables.css';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayApts, setTodayApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctorData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [statsData, aptsData] = await Promise.all([
          api.get(`/analytics/dashboard?role=DOCTOR&userId=${profile?.id || ''}`),
          api.get(`/appointments?date=${todayStr}`)
        ]);
        setStats(statsData);
        setTodayApts(aptsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, [profile]);

  return (
    <div>
      <Navbar title="Doctor Dashboard" subtitle={`Consultation portal for ${profile?.name || 'Doctor'}`} />

      <div className="stats-grid">
        <StatCard label="Today's Appointments" value={stats?.todayAppointments || 0} subtext="Scheduled visits for today" />
        <StatCard label="Waiting in Queue" value={stats?.waitingPatients || 0} subtext="Active tokens" subtextColor="highlight" />
        <StatCard label="Completed Consultations" value={stats?.completedConsultations || 0} subtext="Today's completed visits" subtextColor="positive" />
        <StatCard label="Total Lifetime Patients" value={stats?.totalAppointments || 0} subtext="Appointments treated" />
      </div>

      <div className="dashboard-columns">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">Today's Consultation Schedule</h2>
            <Link to="/doctor/appointments" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {loading ? (
            <div>Loading consultation schedule...</div>
          ) : todayApts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              No appointments booked for today.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Patient Name</th>
                    <th>Reason / Symptoms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayApts.map(apt => (
                    <tr key={apt.id}>
                      <td><strong>{apt.appointment_time}</strong></td>
                      <td>
                        <div className="table-patient-info">
                          <span className="patient-name">{apt.patients?.profiles?.name || 'Patient Record'}</span>
                          <span className="patient-sub">{apt.patients?.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td>{apt.reason || apt.symptoms || 'General Consultation'}</td>
                      <td>
                        <span className={`badge badge-${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Queue Action Card */}
        <div className="card" style={{ backgroundColor: 'var(--color-subtle-bg)' }}>
          <h2 className="card-title">Live Patient Queue</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Call waiting patients, update progress, and complete consultations.
          </p>
          <Link to="/doctor/queue" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Clock size={18} /> Launch Live Consultation Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
