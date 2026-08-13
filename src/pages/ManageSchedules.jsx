import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import '../styles/tables.css';

export default function ManageSchedules() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const data = await api.get('/doctors');
        setDoctors(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  return (
    <div>
      <Navbar title="Manage Schedules" subtitle="Overview of weekly doctor consultation schedules" />

      {loading ? (
        <div>Loading doctor schedules...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department</th>
                <th>Weekly Working Days</th>
                <th>Slot Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.profiles?.name || 'Dr. Specialist'}</strong>
                  </td>
                  <td>{doc.departments?.name}</td>
                  <td>Mon, Wed, Fri (09:00 AM - 01:00 PM)</td>
                  <td>30 mins</td>
                  <td>
                    <span className="badge badge-confirmed">ACTIVE SCHEDULE</span>
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
