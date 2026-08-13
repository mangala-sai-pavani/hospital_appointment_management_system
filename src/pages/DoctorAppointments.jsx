import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ScheduleFollowUpModal from '../components/ScheduleFollowUpModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, UserX, PlusCircle, AlertTriangle } from 'lucide-react';
import '../styles/tables.css';

export default function DoctorAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedAptForFollowUp, setSelectedAptForFollowUp] = useState(null);

  const fetchApts = async () => {
    try {
      const data = await api.get('/appointments');
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApts();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      fetchApts();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleMarkNoShow = async (id) => {
    if (!window.confirm('Mark this patient as NO SHOW? (Ensure appointment time has passed)')) return;
    try {
      await api.put(`/appointments/${id}/no-show`, {});
      fetchApts();
    } catch (err) {
      alert(err.message || 'Failed to mark NO SHOW');
    }
  };

  const handleOpenFollowUp = (apt) => {
    setSelectedAptForFollowUp(apt);
    setIsFollowUpModalOpen(true);
  };

  return (
    <div>
      <Navbar title="Doctor Appointments" subtitle="Manage patient appointments and consultation statuses" />

      {loading ? (
        <div>Loading appointments...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient Details</th>
                <th>Priority</th>
                <th>Reason / Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <strong>{apt.appointment_date}</strong>
                    <div className="patient-sub">{apt.appointment_time}</div>
                  </td>
                  <td>
                    <div className="table-patient-info">
                      <span className="patient-name">{apt.patients?.profiles?.name || 'Patient'}</span>
                      <span className="patient-sub">Gender: {apt.patients?.gender || 'N/A'}, Blood: {apt.patients?.blood_group || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    {apt.priority === 'EMERGENCY' ? (
                      <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #fecaca' }}>
                        🚨 EMERGENCY
                      </span>
                    ) : apt.priority === 'URGENT' ? (
                      <span style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #fde68a' }}>
                        ⚡ URGENT
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td>{apt.reason || apt.symptoms || 'General Consultation'}</td>
                  <td>
                    <span className={`badge badge-${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {apt.status === 'PENDING' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#10b981', color: '#ffffff' }}
                          onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        >
                          Mark Completed
                        </button>
                      )}

                      {apt.status === 'COMPLETED' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#0f766e' }}
                          onClick={() => handleOpenFollowUp(apt)}
                        >
                          <PlusCircle size={12} /> Schedule Follow-Up
                        </button>
                      )}

                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW' && (
                        <button
                          className="btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleMarkNoShow(apt.id)}
                        >
                          <UserX size={12} /> Mark No-Show
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Follow-Up Scheduler Modal */}
      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        appointment={selectedAptForFollowUp}
        onSuccess={() => fetchApts()}
      />
    </div>
  );
}
