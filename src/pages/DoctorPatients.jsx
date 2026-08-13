import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import '../styles/tables.css';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await api.get('/patients');
        setPatients(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  return (
    <div>
      <Navbar title="Patient Directory" subtitle="View clinical patient profiles and contact details" />

      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>DOB / Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Emergency Contact</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="table-patient-info">
                      <span className="patient-name">{p.profiles?.name || 'Patient'}</span>
                      <span className="patient-sub">{p.profiles?.email}</span>
                    </div>
                  </td>
                  <td>
                    {p.date_of_birth || 'N/A'} ({p.gender})
                  </td>
                  <td><strong>{p.blood_group || 'N/A'}</strong></td>
                  <td>{p.phone || p.profiles?.phone || 'N/A'}</td>
                  <td>{p.emergency_contact || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
