import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { validateDate } from '../utils/validation';
import '../styles/forms.css';

const TIME_SLOTS = [
  '09:00:00', '09:30:00', '10:00:00', '10:30:00', 
  '11:00:00', '11:30:00', '14:00:00', '14:30:00', 
  '15:00:00', '15:30:00', '16:00:00', '16:30:00'
];

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const initialDocId = searchParams.get('doctor_id') || '';
  const initialMode = searchParams.get('mode') === 'emergency' ? 'EMERGENCY' : 'STANDARD';

  const { profile } = useAuth();
  const navigate = useNavigate();

  const [bookingMode, setBookingMode] = useState(initialMode); // 'STANDARD' | 'EMERGENCY'
  
  // Data lists
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');

  // Standard Form State
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  // Emergency Form State
  const [emergencyDeptId, setEmergencyDeptId] = useState('');
  const [emergencyDocId, setEmergencyDocId] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencySymptoms, setEmergencySymptoms] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Status & Validation
  const [existingBookedSlots, setExistingBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [docsData, deptsData, patientsData] = await Promise.all([
          api.get('/doctors'),
          api.get('/departments'),
          api.get('/patients')
        ]);
        setDoctors(docsData || []);
        setDepartments(deptsData || []);

        if (initialDocId) {
          setSelectedDocId(initialDocId);
        } else if (docsData && docsData.length > 0) {
          setSelectedDocId(docsData[0].id);
        }

        if (deptsData && deptsData.length > 0) {
          setEmergencyDeptId(deptsData[0].id);
        }

        // Match current profile to patient record
        const myPat = (patientsData || []).find((p: any) => p.profile_id === profile?.id || p.id === profile?.id);
        if (myPat) {
          setPatientId(myPat.id);
        } else if (patientsData && patientsData.length > 0) {
          setPatientId(patientsData[0].id);
        }
      } catch (err) {
        console.error('Failed to load booking dependencies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [profile, initialDocId]);

  // Load booked slots whenever selected doctor or date changes in standard mode
  useEffect(() => {
    if (bookingMode !== 'STANDARD' || !selectedDocId || !appointmentDate) return;
    async function fetchOccupiedSlots() {
      try {
        const apts = await api.get(`/appointments?doctor_id=${selectedDocId}&date=${appointmentDate}`);
        const bookedTimes = (apts || [])
          .filter((a: any) => a.status !== 'CANCELLED')
          .map((a: any) => a.appointment_time);
        setExistingBookedSlots(bookedTimes);
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
      }
    }
    fetchOccupiedSlots();
  }, [selectedDocId, appointmentDate, bookingMode]);

  const selectedDoctor = doctors.find(d => d.id === selectedDocId);
  const availableEmergencyDocs = doctors.filter(d => 
    (!emergencyDeptId || d.department_id === emergencyDeptId) && d.availability_status !== 'ON_LEAVE'
  );

  // Submit Standard Appointment
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedTime) {
      setError('Please select an available time slot for your consultation.');
      return;
    }

    const dateErr = validateDate(appointmentDate, false, 'Appointment Date');
    if (dateErr) {
      setError(dateErr);
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/appointments', {
        patient_id: patientId,
        doctor_id: selectedDocId,
        department_id: selectedDoctor?.department_id,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        reason: reason || 'Standard Medical Consultation',
        symptoms,
        priority: 'NORMAL'
      });

      setSuccessMsg('Appointment booked successfully!');
      setTimeout(() => navigate('/patient/appointments'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment slot. Slot may be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Emergency Appointment
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!disclaimerAccepted) {
      setError('You must acknowledge the emergency triage disclaimer before proceeding.');
      return;
    }

    if (!emergencyReason.trim()) {
      setError('Please provide the primary nature of the medical emergency.');
      return;
    }

    setSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeNowStr = new Date().toTimeString().split(' ')[0]; // e.g. 10:30:00

      const assignedDocId = emergencyDocId || (availableEmergencyDocs[0]?.id) || selectedDocId;

      await api.post('/appointments/emergency', {
        patient_id: patientId,
        department_id: emergencyDeptId || selectedDoctor?.department_id,
        doctor_id: assignedDocId,
        appointment_date: todayStr,
        appointment_time: timeNowStr,
        reason: emergencyReason,
        symptoms: emergencySymptoms,
        priority: 'EMERGENCY'
      });

      setSuccessMsg('🚨 Emergency appointment dispatched! Top queue token assigned.');
      setTimeout(() => navigate('/patient/queue-status'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch emergency appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':');
    const h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${mins} ${ampm}`;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <Navbar
        title="Book Appointment"
        subtitle="Schedule a specialist consultation or dispatch an urgent emergency request"
        actionButton={null}
      />

      {/* Booking Mode Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => {
            setBookingMode('STANDARD');
            setError('');
          }}
          style={{
            padding: '1rem',
            borderRadius: '16px',
            border: bookingMode === 'STANDARD' ? '2px solid var(--color-primary-dark)' : '1px solid var(--color-border)',
            backgroundColor: bookingMode === 'STANDARD' ? '#f0fdf4' : '#ffffff',
            color: bookingMode === 'STANDARD' ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxShadow: bookingMode === 'STANDARD' ? '0 4px 12px rgba(15, 118, 110, 0.12)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Calendar size={20} /> Standard Consultation
        </button>

        <button
          type="button"
          onClick={() => {
            setBookingMode('EMERGENCY');
            setError('');
          }}
          style={{
            padding: '1rem',
            borderRadius: '16px',
            border: bookingMode === 'EMERGENCY' ? '2px solid #dc2626' : '1px solid var(--color-border)',
            backgroundColor: bookingMode === 'EMERGENCY' ? '#fef2f2' : '#ffffff',
            color: bookingMode === 'EMERGENCY' ? '#dc2626' : 'var(--color-text-main)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxShadow: bookingMode === 'EMERGENCY' ? '0 4px 12px rgba(220, 38, 38, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldAlert size={20} /> 🚨 Emergency Fast-Track
        </button>
      </div>

      {/* Global Banners */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700
        }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading healthcare schedule system...
        </div>
      ) : bookingMode === 'STANDARD' ? (
        /* STANDARD BOOKING FORM */
        <form onSubmit={handleStandardSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Select Medical Specialist *</label>
            <select
              className="form-select"
              value={selectedDocId}
              onChange={e => {
                setSelectedDocId(e.target.value);
                setSelectedTime('');
              }}
              required
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.profiles?.name || 'Dr. Specialist'} — {doc.specialization} (${doc.consultation_fee})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div style={{
              backgroundColor: 'var(--color-subtle-bg)',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--color-border)'
            }}>
              <div>
                <strong style={{ color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
                  {selectedDoctor.departments?.name} Department
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  {selectedDoctor.qualification} ({selectedDoctor.experience_years} yrs experience)
                </div>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Fee: ${selectedDoctor.consultation_fee}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Consultation Date *</label>
            <input
              type="date"
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              value={appointmentDate}
              onChange={e => {
                setAppointmentDate(e.target.value);
                setSelectedTime('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Time Slots *</label>
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => {
                const isBooked = existingBookedSlots.includes(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    className={`slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'disabled' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Reason for Visit</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Routine consultation, annual physical checkup, lab review"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Symptoms / Additional Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe any specific symptoms or medical history notes..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
            disabled={submitting}
          >
            {submitting ? 'Verifying & Confirming Slot...' : 'Confirm Consultation Booking'}
          </button>
        </form>
      ) : (
        /* EMERGENCY FAST-TRACK FORM */
        <form onSubmit={handleEmergencySubmit} className="card" style={{ borderTop: '6px solid #dc2626' }}>
          {/* Emergency Triage Notice */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={22} /> EMERGENCY TRIAGE PROTOCOL & DISCLAIMER
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d', lineHeight: 1.5 }}>
              Emergency bookings are granted <strong>IMMEDIATE TOP PRIORITY QUEUE STATUS</strong> for urgent medical triage. If you or the patient are experiencing critical life-threatening conditions (e.g. severe chest pain, stroke symptoms, loss of consciousness, heavy hemorrhage), <strong>please call local emergency services (911 / 108) or report directly to the ER immediately</strong>.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Select Emergency Department *</label>
            <select
              className="form-select"
              value={emergencyDeptId}
              onChange={e => {
                setEmergencyDeptId(e.target.value);
                setEmergencyDocId('');
              }}
              required
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} Department
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Specialist (Optional - First Available Auto-Assigned)</label>
            <select
              className="form-select"
              value={emergencyDocId}
              onChange={e => setEmergencyDocId(e.target.value)}
            >
              <option value="">-- Auto-Assign First Available Emergency Specialist --</option>
              {availableEmergencyDocs.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.profiles?.name || 'Dr. Specialist'} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nature of Medical Emergency *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. High sudden fever, acute abdominal pain, severe allergic reaction"
              value={emergencyReason}
              onChange={e => setEmergencyReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observed Symptoms & Vital Status</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail onset time, pain severity scale (1-10), breathing status, etc..."
              value={emergencySymptoms}
              onChange={e => setEmergencySymptoms(e.target.value)}
            />
          </div>

          <div style={{
            margin: '1.25rem 0',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <input
              type="checkbox"
              id="emergency-terms-check"
              checked={disclaimerAccepted}
              onChange={e => setDisclaimerAccepted(e.target.checked)}
              style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label htmlFor="emergency-terms-check" style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', cursor: 'pointer', lineHeight: 1.4, fontWeight: 600 }}>
              I confirm that this is an urgent medical condition requiring immediate triage evaluation, and I acknowledge that false emergency bookings may incur administrative penalties.
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justify: 'center',
              marginTop: '1rem',
              padding: '0.9rem',
              backgroundColor: '#dc2626',
              borderColor: '#b91c1c',
              fontSize: '1rem',
              fontWeight: 800
            }}
            disabled={submitting}
          >
            {submitting ? 'Dispatching Emergency Token...' : '🚨 Dispatch Emergency Booking Request'}
          </button>
        </form>
      )}
    </div>
  );
}
