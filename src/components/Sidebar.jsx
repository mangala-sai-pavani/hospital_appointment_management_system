import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  Building2, 
  Clock, 
  LogOut, 
  Search, 
  PlusCircle, 
  Bell, 
  User,
  Activity,
  Truck
} from 'lucide-react';

export default function Sidebar() {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Manage Doctors', path: '/admin/doctors', icon: UserCheck },
          { label: 'Receptionists', path: '/admin/receptionists', icon: Users },
          { label: 'Patients', path: '/admin/patients', icon: Users },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { label: 'Ambulance Service', path: '/admin/ambulance', icon: Truck },
          { label: '24h Reminders', path: '/admin/reminders', icon: Bell },
          { label: 'Analytics', path: '/admin/analytics', icon: Activity },
        ];
      case 'DOCTOR':
        return [
          { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { label: 'Live Queue', path: '/doctor/queue', icon: Clock },
          { label: 'Patients', path: '/doctor/patients', icon: Users },
          { label: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
          { label: 'Profile', path: '/doctor/profile', icon: User },
        ];
      case 'RECEPTIONIST':
        return [
          { label: 'Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { label: 'New Patient', path: '/receptionist/patient-register', icon: PlusCircle },
          { label: 'Patient Search', path: '/receptionist/patient-search', icon: Search },
          { label: 'Book Appointment', path: '/receptionist/book-appointment', icon: Calendar },
          { label: 'Manage Appointments', path: '/receptionist/appointments', icon: Calendar },
          { label: 'Queue Management', path: '/receptionist/queue', icon: Clock },
          { label: 'Ambulance Dispatch', path: '/receptionist/ambulance', icon: Truck },
          { label: '24h Reminders', path: '/receptionist/reminders', icon: Bell },
        ];
      case 'PATIENT':
      default:
        return [
          { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Find Doctor', path: '/patient/find-doctor', icon: Search },
          { label: 'Book Appointment', path: '/patient/book', icon: PlusCircle },
          { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { label: 'Queue Status', path: '/patient/queue-status', icon: Clock },
          { label: 'Notifications', path: '/patient/notifications', icon: Bell },
          { label: 'Profile', path: '/patient/profile', icon: User },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">M</div>
        <span className="sidebar-logo-title">MedPoint</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{profile?.name || 'User'}</div>
          <div className="user-role">{role}</div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#e8f1f0', cursor: 'pointer', marginLeft: 'auto', opacity: 0.7 }}
          title="Log Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
