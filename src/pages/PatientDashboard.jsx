import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import PatientQRCheckInModal from '../components/PatientQRCheckInModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Calendar, Clock, User, ChevronRight, QrCode, Sparkles, Truck, Phone, MapPin } from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/tables.css';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [ambulanceRequests, setAmbulanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, aptsData, ambData] = await Promise.all([
        api.get(`/analytics/dashboard?role=PATIENT&userId=${profile?.id || ''}`),
        api.get(`/appointments?patient_id=${profile?.id || ''}`),
        api.get('/ambulance/requests')
      ]);
      setStats(statsData);
      setAppointments(aptsData || []);
      setAmbulanceRequests(ambData || []);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  return (
    <div>
      <Navbar
        title="Patient Dashboard"
        subtitle={`Welcome back, ${profile?.name || 'Patient'}`}
        actionButton={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
              <QrCode size={18} /> Desk QR Express Check-In
            </button>
            <Link to="/patient/book" className="btn-secondary">
              <PlusCircle size={18} /> + New Visit
            </Link>
          </div>
        }
      />

      {/* Express Desk Check-In Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#047857', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Reception Desk Express QR Check-In <Sparkles size={16} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                At the hospital reception desk? Scan the desk QR code to instantly switch your status to <strong>ARRIVED</strong>.
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
            <QrCode size={16} /> Instant QR Check-In
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Upcoming Appointments" value={stats?.upcomingAppointmentsCount || 0} subtext="Scheduled visits" />
        <StatCard label="Total Visits" value={stats?.totalAppointments || 0} subtext="Lifetime medical visits" />
        <StatCard label="Completed Consultations" value={stats?.completedCount || 0} subtext="Past checkups" subtextColor="positive" />
        <StatCard label="Active Queue Status" value={stats?.nextAppointment ? 'Ready' : 'None'} subtext="Token state" />
      </div>

      <div className="dashboard-columns">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">My Recent Appointments</h2>
            <Link to="/patient/appointments" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {loading ? (
            <div>Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div style={{ textTransform: 'none', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              You have no scheduled appointments yet.
              <br />
              <Link to="/patient/book" className="btn-primary" style={{ marginTop: '1rem' }}>
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt.id}>
                      <td>
                        <div className="table-patient-info">
                          <span className="patient-name">{apt.doctors?.profiles?.name || 'Dr. Specialist'}</span>
                          <span className="patient-sub">{apt.doctors?.specialization || 'Consultant'}</span>
                        </div>
                      </td>
                      <td>{apt.departments?.name || 'General'}</td>
                      <td>
                        <strong>{apt.appointment_date}</strong>
                        <div className="patient-sub">{apt.appointment_time}</div>
                      </td>
                      <td>
                        {apt.arrival_status === 'ARRIVED' ? (
                          <span className="badge badge-confirmed" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                            ✓ ARRIVED
                          </span>
                        ) : (
                          <span className={`badge badge-${apt.status.toLowerCase()}`}>
                            {apt.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links / Queue Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ backgroundColor: 'var(--color-subtle-bg)' }}>
            <h3 className="card-title">Live Queue Status</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Check in for today's appointment to view live queue position numbers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
                <QrCode size={16} /> Scan Desk QR to Arrive
              </button>
              <Link to="/patient/queue-status" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Clock size={16} /> Open Queue Monitor
              </Link>
            </div>
          </div>

          {/* Hospital Ambulance Transport Status */}
          <div className="card" style={{ borderTop: '4px solid #0f766e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e' }}>
                <Truck size={18} /> Hospital Transport
              </h3>
              <Link to="/patient/appointments" style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700, textDecoration: 'none' }}>
                Request Transport
              </Link>
            </div>

            {ambulanceRequests.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Need help traveling to your scheduled hospital appointment? Request non-emergency transport directly from your appointment details.
              </p>
            ) : (
              <div>
                {ambulanceRequests.slice(0, 2).map(ambReq => (
                  <div key={ambReq.id} style={{
                    backgroundColor: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700 }}>Pickup: {ambReq.pickup_address}</span>
                      <span className={`badge badge-${ambReq.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                        {ambReq.status}
                      </span>
                    </div>

                    {ambReq.ambulances && (
                      <div style={{ color: '#047857', fontWeight: 600, marginTop: '0.25rem' }}>
                        Vehicle: {ambReq.ambulances.vehicle_number} ({ambReq.ambulances.driver_name})
                      </div>
                    )}

                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Est. Fee: ${Number(ambReq.final_fee || ambReq.estimated_fee || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ backgroundColor: 'var(--color-sidebar)', color: '#ffffff' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hospital Emergency
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0.75rem 0' }}>
              +1 (555) 092-1000
            </div>
            <div style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-sidebar-item)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
              24/7 Triage & Nurse Line
            </div>
          </div>
        </div>
      </div>

      <PatientQRCheckInModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onCheckInSuccess={() => loadData()}
      />
    </div>
  );
}

