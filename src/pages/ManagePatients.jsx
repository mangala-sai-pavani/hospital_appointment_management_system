import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import '../styles/tables.css';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await api.get('/patients');
        setPatients(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  return (
    <div>
      <Navbar title="Manage Patients" subtitle="Comprehensive patient record database" />

      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>DOB & Gender</th>
                <th>Blood Group</th>
                <th>Phone Number</th>
                <th>Address</th>
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
                  <td>{p.date_of_birth || 'N/A'} ({p.gender})</td>
                  <td><strong>{p.blood_group || 'N/A'}</strong></td>
                  <td>{p.phone || p.profiles?.phone || 'N/A'}</td>
                  <td>{p.address || 'N/A'}</td>
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
