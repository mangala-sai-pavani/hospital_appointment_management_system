import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-main)' }}>
        <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>Loading Hospital Management System...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if unauthorized for this route
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
