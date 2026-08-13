import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import '../styles/tables.css';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApts() {
      try {
        const data = await api.get('/appointments');
        setAppointments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApts();
  }, []);

  return (
    <div>
      <Navbar title="Manage All Appointments" subtitle="Hospital master booking records" />

      {loading ? (
        <div>Loading appointments...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor & Dept</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <strong>{apt.patients?.profiles?.name || 'Patient'}</strong>
                  </td>
                  <td>
                    <div>{apt.doctors?.profiles?.name}</div>
                    <div className="patient-sub">{apt.departments?.name}</div>
                  </td>
                  <td>
                    <strong>{apt.appointment_date}</strong>
                    <div className="patient-sub">{apt.appointment_time}</div>
                  </td>
                  <td>{apt.reason || 'Consultation'}</td>
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
  );
}
