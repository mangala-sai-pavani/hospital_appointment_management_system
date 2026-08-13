import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PatientQRCheckInModal from '../components/PatientQRCheckInModal';
import RescheduleModal from '../components/RescheduleModal';
import CancelAppointmentModal from '../components/CancelAppointmentModal';
import EmergencyBookingModal from '../components/EmergencyBookingModal';
import RequestAmbulanceModal from '../components/RequestAmbulanceModal';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

import {
  QrCode,
  UserCheck,
  ShieldAlert,
  RefreshCw,
  Truck,
  AlertCircle
} from 'lucide-react';

import '../styles/tables.css';

export default function MyAppointments() {
  const { profile } = useAuth();

  // -----------------------------
  // State
  // -----------------------------

  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState(null);

  const [activeFilter, setActiveFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -----------------------------
  // Modal States
  // -----------------------------

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedAptForQr, setSelectedAptForQr] = useState(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAptForReschedule, setSelectedAptForReschedule] =
    useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAptForCancel, setSelectedAptForCancel] = useState(null);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [selectedAptForAmbulance, setSelectedAptForAmbulance] =
    useState(null);

  // -----------------------------
  // Find Patient Record
  // -----------------------------

  const resolvePatient = useCallback(async () => {
    if (!profile?.id) {
      return null;
    }

    try {
      const patients = await api.get('/patients');

      const currentPatient = (patients || []).find(
        (patient) => patient.profile_id === profile.id
      );

      if (!currentPatient) {
        console.error(
          'No patient record found for profile:',
          profile.id
        );

        setError(
          'Patient profile could not be found. Please contact hospital administration.'
        );

        return null;
      }

      setPatientId(currentPatient.id);

      return currentPatient;
    } catch (err) {
      console.error('Failed to resolve patient:', err);

      setError(
        err.message || 'Unable to load patient information.'
      );

      return null;
    }
  }, [profile?.id]);

  // -----------------------------
  // Fetch Appointments
  // -----------------------------

  const fetchAppointments = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // IMPORTANT:
      // profile.id = profiles.id
      // appointments.patient_id = patients.id
      //
      // Therefore we first resolve the patient record.

      let currentPatientId = patientId;

      if (!currentPatientId) {
        const patient = await resolvePatient();

        if (!patient) {
          setAppointments([]);
          return;
        }

        currentPatientId = patient.id;
      }

      // Fetch appointments using patients.id
      const data = await api.get(
        `/appointments?patient_id=${currentPatientId}`
      );

      setAppointments(data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);

      setError(
        err.message || 'Failed to load your appointments.'
      );

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, patientId, resolvePatient]);

  // -----------------------------
  // Initial Load
  // -----------------------------

  useEffect(() => {
    if (profile?.id) {
      fetchAppointments();
    }
  }, [profile?.id, fetchAppointments]);

  // -----------------------------
  // Modal Handlers
  // -----------------------------

  const handleOpenQrCheckIn = (appointmentId = null) => {
    setSelectedAptForQr(appointmentId);
    setIsQrModalOpen(true);
  };

  const handleOpenReschedule = (appointment) => {
    setSelectedAptForReschedule(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleOpenCancel = (appointment) => {
    setSelectedAptForCancel(appointment);
    setIsCancelModalOpen(true);
  };

  const handleOpenAmbulance = (appointment) => {
    setSelectedAptForAmbulance(appointment);
    setIsAmbulanceModalOpen(true);
  };

  // -----------------------------
  // Filter Appointments
  // -----------------------------

  const filteredAppointments = appointments.filter(
    (appointment) =>
      activeFilter === 'ALL' ||
      appointment.status === activeFilter
  );

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div>
      <Navbar
        title="My Appointments"
        subtitle="View and manage your scheduled hospital visits"
        actionButton={
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              className="btn-primary"
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#b91c1c'
              }}
              onClick={() => setIsEmergencyModalOpen(true)}
            >
              <ShieldAlert size={16} />
              Emergency Booking
            </button>

            <button
              className="btn-primary"
              style={{
                backgroundColor: '#0f766e'
              }}
              onClick={() => handleOpenQrCheckIn()}
            >
              <QrCode size={16} />
              Desk Express QR Check-In
            </button>
          </div>
        }
      />

      {/* -------------------------------- */}
      {/* Error Banner */}
      {/* -------------------------------- */}

      {error && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <AlertCircle size={18} />

          <span>{error}</span>
        </div>
      )}

      {/* -------------------------------- */}
      {/* Reception Desk Banner */}
      {/* -------------------------------- */}

      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          backgroundColor: '#ecfdf5',
          borderColor: '#a7f3d0'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={22} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: '#047857',
                  fontSize: '1.05rem'
                }}
              >
                Arrived at the Clinic Reception Desk?
              </div>

              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#065f46'
                }}
              >
                Scan the reception desk QR code to update your
                status to <strong>Arrived</strong> and receive your
                queue token.
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              backgroundColor: '#0f766e'
            }}
            onClick={() => handleOpenQrCheckIn()}
          >
            <QrCode size={16} />
            Scan Desk QR Code
          </button>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Status Filters */}
      {/* -------------------------------- */}

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        {[
          'ALL',
          'PENDING',
          'CONFIRMED',
          'COMPLETED',
          'NO_SHOW',
          'CANCELLED'
        ].map((status) => (
          <button
            key={status}
            className="btn-secondary"
            style={{
              backgroundColor:
                activeFilter === status
                  ? 'var(--color-primary-dark)'
                  : 'var(--color-card-bg)',

              color:
                activeFilter === status
                  ? '#ffffff'
                  : 'var(--color-primary-dark)',

              borderColor:
                activeFilter === status
                  ? 'var(--color-primary-dark)'
                  : 'var(--color-border)'
            }}
            onClick={() => setActiveFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* -------------------------------- */}
      {/* Loading */}
      {/* -------------------------------- */}

      {loading ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-muted)'
          }}
        >
          Loading your appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        /* -------------------------------- */
        /* Empty State */
        /* -------------------------------- */

        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '0.75rem'
            }}
          >
            📅
          </div>

          <strong>
            No appointments found
          </strong>

          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            No appointments match "{activeFilter}".
          </div>
        </div>
      ) : (
        /* -------------------------------- */
        /* Appointment Table */
        /* -------------------------------- */

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Priority</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  {/* Doctor */}

                  <td>
                    <div className="table-patient-info">
                      <span className="patient-name">
                        {appointment.doctors?.profiles?.name ||
                          'Dr. Specialist'}
                      </span>

                      <span className="patient-sub">
                        {appointment.doctors?.specialization ||
                          'Specialist'}
                      </span>
                    </div>
                  </td>

                  {/* Department */}

                  <td>
                    {appointment.departments?.name ||
                      appointment.doctors?.departments?.name ||
                      'General Medicine'}
                  </td>

                  {/* Date / Time */}

                  <td>
                    <strong>
                      {appointment.appointment_date}
                    </strong>

                    <div className="patient-sub">
                      {appointment.appointment_time}
                    </div>
                  </td>

                  {/* Priority */}

                  <td>
                    {appointment.priority === 'EMERGENCY' ? (
                      <span
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          border: '1px solid #fecaca'
                        }}
                      >
                        🚨 EMERGENCY
                      </span>
                    ) : appointment.priority === 'URGENT' ? (
                      <span
                        style={{
                          backgroundColor: '#fffbeb',
                          color: '#d97706',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          border: '1px solid #fde68a'
                        }}
                      >
                        ⚡ URGENT
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        NORMAL
                      </span>
                    )}
                  </td>

                  {/* Reason */}

                  <td>
                    {appointment.reason ||
                      'General Consultation'}
                  </td>

                  {/* Status */}

                  <td>
                    {appointment.arrival_status === 'ARRIVED' ? (
                      <span
                        className="badge badge-confirmed"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff'
                        }}
                      >
                        ✓ ARRIVED
                      </span>
                    ) : (
                      <span
                        className={`badge badge-${(
                          appointment.status || ''
                        ).toLowerCase()}`}
                      >
                        {appointment.status}
                      </span>
                    )}
                  </td>

                  {/* Actions */}

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.4rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      {appointment.arrival_status ===
                      'ARRIVED' ? (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#047857',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <UserCheck size={14} />
                          Checked-In
                        </span>
                      ) : (
                        <>
                          {(appointment.status === 'CONFIRMED' ||
                            appointment.status === 'PENDING') && (
                            <>
                              <button
                                className="btn-primary"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#0f766e'
                                }}
                                onClick={() =>
                                  handleOpenQrCheckIn(
                                    appointment.id
                                  )
                                }
                              >
                                <QrCode size={12} />
                                Scan QR
                              </button>

                              <button
                                className="btn-secondary"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#f0fdf4',
                                  color: '#166534',
                                  borderColor: '#bbf7d0'
                                }}
                                onClick={() =>
                                  handleOpenAmbulance(
                                    appointment
                                  )
                                }
                              >
                                <Truck size={12} />
                                Request Ambulance
                              </button>

                              <button
                                className="btn-secondary"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem'
                                }}
                                onClick={() =>
                                  handleOpenReschedule(
                                    appointment
                                  )
                                }
                              >
                                <RefreshCw size={12} />
                                Reschedule
                              </button>

                              <button
                                className="btn-danger"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem'
                                }}
                                onClick={() =>
                                  handleOpenCancel(
                                    appointment
                                  )
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------------------- */}
      {/* QR Check-In Modal */}
      {/* -------------------------------- */}

      <PatientQRCheckInModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSelectedAptForQr(null);
        }}
        initialAppointmentId={selectedAptForQr}
        onCheckInSuccess={() => {
          setIsQrModalOpen(false);
          fetchAppointments();
        }}
      />

      {/* -------------------------------- */}
      {/* Reschedule Modal */}
      {/* -------------------------------- */}

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedAptForReschedule(null);
        }}
        appointment={selectedAptForReschedule}
        onSuccess={() => {
          setIsRescheduleModalOpen(false);
          fetchAppointments();
        }}
      />

      {/* -------------------------------- */}
      {/* Cancel Modal */}
      {/* -------------------------------- */}

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAptForCancel(null);
        }}
        appointment={selectedAptForCancel}
        onSuccess={() => {
          setIsCancelModalOpen(false);
          fetchAppointments();
        }}
      />

      {/* -------------------------------- */}
      {/* Emergency Booking Modal */}
      {/* -------------------------------- */}

      <EmergencyBookingModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        patientId={patientId}
        onSuccess={() => {
          setIsEmergencyModalOpen(false);
          fetchAppointments();
        }}
      />

      {/* -------------------------------- */}
      {/* Ambulance Modal */}
      {/* -------------------------------- */}

      <RequestAmbulanceModal
        isOpen={isAmbulanceModalOpen}
        onClose={() => {
          setIsAmbulanceModalOpen(false);
          setSelectedAptForAmbulance(null);
        }}
        appointment={selectedAptForAmbulance}
        patientProfile={profile}
        onSuccess={() => {
          setIsAmbulanceModalOpen(false);
          fetchAppointments();
        }}
      />
    </div>
  );
}