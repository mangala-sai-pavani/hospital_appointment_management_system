import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/tables.css';

export default function ManageReceptionists() {
  const receptionists = [
    { id: '1', name: 'Receptionist Mark Davis', email: 'receptionist@hospital.com', phone: '+1-555-0102', status: 'ACTIVE' }
  ];

  return (
    <div>
      <Navbar title="Manage Receptionists" subtitle="Front-desk administrative staff directory" />

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {receptionists.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  <span className="badge badge-confirmed">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
