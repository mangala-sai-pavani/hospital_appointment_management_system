import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection wrapper requiring authenticated user session.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ fontWeight: 600, color: '#1e293b' }}>Authenticating user session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Role-based route protection wrapper restricting access to specific user roles.
 */
export function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ fontWeight: 600, color: '#1e293b' }}>Validating user permissions...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect user to their role-specific dashboard
    switch (role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'RECEPTIONIST':
        return <Navigate to="/receptionist/dashboard" replace />;
      case 'PATIENT':
      default:
        return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
