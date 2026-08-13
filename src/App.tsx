import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard';
import FindDoctor from './pages/FindDoctor';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import QueueStatus from './pages/QueueStatus';
import Notifications from './pages/Notifications';
import PatientProfile from './pages/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorQueue from './pages/DoctorQueue';
import DoctorPatients from './pages/DoctorPatients';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorProfile from './pages/DoctorProfile';

// Receptionist Pages
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientSearch from './pages/PatientSearch';
import AppointmentManagement from './pages/AppointmentManagement';
import QueueManagement from './pages/QueueManagement';

// Shared Services
import ReminderService from './pages/ReminderService';
import AmbulanceService from './pages/AmbulanceService';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManageReceptionists from './pages/ManageReceptionists';
import ManagePatients from './pages/ManagePatients';
import ManageDepartments from './pages/ManageDepartments';
import ManageSchedules from './pages/ManageSchedules';
import ManageAppointments from './pages/ManageAppointments';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Routes */}
          <Route element={<DashboardLayout allowedRoles={['PATIENT']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/find-doctor" element={<FindDoctor />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/queue-status" element={<QueueStatus />} />
            <Route path="/patient/notifications" element={<Notifications />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Routes */}
          <Route element={<DashboardLayout allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/queue" element={<DoctorQueue />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* Receptionist Routes */}
          <Route element={<DashboardLayout allowedRoles={['RECEPTIONIST']} />}>
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patient-register" element={<PatientRegistration />} />
            <Route path="/receptionist/patient-search" element={<PatientSearch />} />
            <Route path="/receptionist/book-appointment" element={<BookAppointment />} />
            <Route path="/receptionist/appointments" element={<AppointmentManagement />} />
            <Route path="/receptionist/queue" element={<QueueManagement />} />
            <Route path="/receptionist/ambulance" element={<AmbulanceService />} />
            <Route path="/receptionist/reminders" element={<ReminderService />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/receptionists" element={<ManageReceptionists />} />
            <Route path="/admin/patients" element={<ManagePatients />} />
            <Route path="/admin/departments" element={<ManageDepartments />} />
            <Route path="/admin/schedules" element={<ManageSchedules />} />
            <Route path="/admin/appointments" element={<ManageAppointments />} />
            <Route path="/admin/ambulance" element={<AmbulanceService />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/reminders" element={<ReminderService />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
