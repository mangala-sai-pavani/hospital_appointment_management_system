import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import '../styles/tables.css';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchApts();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleJoinQueue = async (aptId) => {
    try {
      await api.post('/queue/join', { appointment_id: aptId });
      alert('Patient checked-in and issued queue token!');
      fetchApts();
    } catch (err) {
      alert(err.message || 'Queue join failed');
    }
  };

  return (
    <div>
      <Navbar title="Receptionist Appointment Desk" subtitle="Confirm, reschedule, check-in, and cancel appointments" />

      {loading ? (
        <div>Loading hospital appointments...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor & Dept</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <div className="table-patient-info">
                      <span className="patient-name">{apt.patients?.profiles?.name || 'Patient'}</span>
                      <span className="patient-sub">{apt.patients?.phone || 'No phone'}</span>
                    </div>
                  </td>
                  <td>
                    <div><strong>{apt.doctors?.profiles?.name || 'Doctor'}</strong></div>
                    <div className="patient-sub">{apt.departments?.name}</div>
                  </td>
                  <td>
                    <strong>{apt.appointment_date}</strong>
                    <div className="patient-sub">{apt.appointment_time}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {apt.status === 'PENDING' && (
                        <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStatus(apt.id, 'CONFIRMED')}>
                          Confirm
                        </button>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleJoinQueue(apt.id)}>
                          Check-In
                        </button>
                      )}
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleStatus(apt.id, 'CANCELLED')}>
                          Cancel
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
    </div>
  );
}
