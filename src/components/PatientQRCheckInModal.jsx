import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generateDataUrl } from '../utils/qrUtils';
import {
  QrCode,
  Camera,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  UserCheck,
  AlertCircle,
  Smartphone,
  RefreshCw
} from 'lucide-react';

export default function PatientQRCheckInModal({ isOpen, onClose, onCheckInSuccess, initialAppointmentId = null }) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('scan'); // 'scan', 'personal_qr', 'code'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Appointments selection
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [selectedAptId, setSelectedAptId] = useState(initialAppointmentId || '');

  // Desk code input
  const [deskCodeInput, setDeskCodeInput] = useState('CAREPULSE-DESK-CHECKIN-2026');

  // Personal QR code Data URL
  const [personalQrUrl, setPersonalQrUrl] = useState('');

  // Camera video stream
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchTodayAppointments();
      setErrorMsg('');
      setSuccessData(null);
    } else {
      stopCamera();
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (activeTab === 'scan' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    if (activeTab === 'personal_qr' && profile) {
      generatePersonalQR();
    }
  }, [activeTab, isOpen]);

  const fetchTodayAppointments = async () => {
    try {
      const apts = await api.get(`/appointments?patient_id=${profile?.id || ''}`);
      const valid = (apts || []).filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
      setTodayAppointments(valid);
      if (valid.length > 0 && !selectedAptId) {
        setSelectedAptId(valid[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generatePersonalQR = async () => {
    const payload = {
      type: 'PATIENT_APPOINTMENT_PASS',
      patient_id: profile?.id,
      patient_name: profile?.name,
      email: profile?.email,
      appointment_id: selectedAptId || 'APT-TODAY',
      timestamp: Date.now()
    };
    const url = await generateDataUrl(payload);
    setPersonalQrUrl(url);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera API not available in this browser context.');
      }
    } catch (err) {
      console.warn('Camera access denied or unmounted:', err);
      setCameraError('Camera access unavailable. You can use Express Scan or enter Desk Code.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handlePerformCheckIn = async (aptIdToUse = null) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const aptId = aptIdToUse || selectedAptId;
      const res = await api.post('/queue/qr-checkin', {
        appointment_id: aptId || undefined,
        patient_id: profile?.id,
        desk_token: deskCodeInput || 'CAREPULSE-DESK-CHECKIN-2026'
      });

      setSuccessData(res);
      stopCamera();
      if (onCheckInSuccess) onCheckInSuccess(res);
    } catch (err) {
      setErrorMsg(err.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    stopCamera();
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Desk QR Express Check-In">
      {successData ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={14} /> STATUS UPDATED TO: ARRIVED
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '0 0 0.25rem 0' }}>
            Check-In Confirmed!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Your presence at the reception desk has been logged in real-time.
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #0f766e',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Queue Token</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary-dark)', lineHeight: 1 }}>
                  #{successData?.queue?.queue_number || successData?.queue_number || '01'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-confirmed" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                  ARRIVED
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155' }}>
              <div><strong>Doctor:</strong> {successData?.appointment?.doctors?.profiles?.name || successData?.queue?.doctors?.profiles?.name || 'Dr. Specialist'}</div>
              <div><strong>Department:</strong> {successData?.appointment?.departments?.name || 'General Outpatient Clinic'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e', fontWeight: 600, marginTop: '0.25rem' }}>
                <MapPin size={16} /> Waiting Zone B • Main Lobby Reception
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            onClick={handleModalClose}
          >
            Done & View Queue Status
          </button>
        </div>
      ) : (
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('scan')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'scan' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'scan' ? '#ffffff' : 'var(--color-text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Camera size={16} /> Scan Desk QR
            </button>

            <button
              onClick={() => setActiveTab('personal_qr')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'personal_qr' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'personal_qr' ? '#ffffff' : 'var(--color-text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Smartphone size={16} /> My QR Pass
            </button>

            <button
              onClick={() => setActiveTab('code')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'code' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'code' ? '#ffffff' : 'var(--color-text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <UserCheck size={16} /> Manual Desk Code
            </button>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Select Appointment dropdown if multiple */}
          {todayAppointments.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>
                Select Appointment to Check-In
              </label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem' }}
                value={selectedAptId}
                onChange={e => setSelectedAptId(e.target.value)}
              >
                {todayAppointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.doctors?.profiles?.name || 'Dr. Specialist'} - {a.appointment_date} ({a.appointment_time}) [{a.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TAB 1: SCAN DESK QR */}
          {activeTab === 'scan' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxHeight: '260px',
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ padding: '2rem', color: '#94a3b8' }}>
                    <QrCode size={48} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      {cameraError || 'Align reception desk QR code within frame'}
                    </div>
                  </div>
                )}

                {/* Scan Viewfinder overlay */}
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  border: '2px dashed #06b6d4',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)'
                }} />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Point camera at the <strong>Reception Desk Check-In QR Display</strong> or tap Express Scan below.
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#0f766e' }}
                disabled={loading}
                onClick={() => handlePerformCheckIn()}
              >
                <QrCode size={18} /> {loading ? 'Confirming Arrival...' : 'Express Scan & Mark "Arrived"'}
              </button>
            </div>
          )}

          {/* TAB 2: MY PERSONAL QR PASS */}
          {activeTab === 'personal_qr' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 0, marginBottom: '1rem' }}>
                Show this digital QR Pass to the reception desk scanner or receptionist to mark your status as <strong>ARRIVED</strong>.
              </p>

              {personalQrUrl ? (
                <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
                  <img src={personalQrUrl} alt="Patient QR Pass" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
              ) : (
                <div style={{ padding: '2rem' }}>Generating QR Pass...</div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Patient: <strong>{profile?.name}</strong> • ID: {profile?.id?.slice(0, 8)}
              </div>

              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                onClick={() => handlePerformCheckIn()}
              >
                <CheckCircle2 size={16} /> Self-Confirm Arrival at Reception Desk
              </button>
            </div>
          )}

          {/* TAB 3: MANUAL DESK CODE */}
          {activeTab === 'code' && (
            <form onSubmit={(e) => { e.preventDefault(); handlePerformCheckIn(); }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Reception Desk Station Passcode</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. CAREPULSE-DESK-CHECKIN-2026"
                  value={deskCodeInput}
                  onChange={e => setDeskCodeInput(e.target.value)}
                  style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Default Reception Station Code: <code>CAREPULSE-DESK-CHECKIN-2026</code>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                disabled={loading}
              >
                <UserCheck size={18} /> {loading ? 'Verifying Check-In...' : 'Submit Code & Update Status to ARRIVED'}
              </button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
