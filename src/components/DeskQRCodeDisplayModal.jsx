import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { generateDataUrl } from '../utils/qrUtils';
import { api } from '../services/api';
import { QrCode, Monitor, Sparkles, CheckCircle, RefreshCw, Printer, UserCheck } from 'lucide-react';

export default function DeskQRCodeDisplayModal({ isOpen, onClose, onRefreshQueue }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [deskPasscode] = useState('CAREPULSE-DESK-CHECKIN-2026');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [receptionMsg, setReceptionMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateDeskQR();
      setReceptionMsg('');
    }
  }, [isOpen]);

  const generateDeskQR = async () => {
    const payload = {
      type: 'RECEPTION_DESK_CHECKIN',
      station: 'CAREPULSE_MAIN_RECEPTION_DESK_01',
      passcode: deskPasscode,
      created_at: new Date().toISOString()
    };
    const url = await generateDataUrl(payload);
    setQrDataUrl(url);
  };

  const handleManualScanPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReceptionMsg('');
    try {
      const res = await api.post('/queue/qr-checkin', {
        patient_id: patientIdInput || undefined,
        desk_token: deskPasscode
      });
      setReceptionMsg(`Patient "${res?.appointment?.patients?.profiles?.name || res?.queue?.patients?.profiles?.name || 'Patient'}" checked in successfully! Status: ARRIVED (Token #${res?.queue?.queue_number || '01'})`);
      setPatientIdInput('');
      if (onRefreshQueue) onRefreshQueue();
    } catch (err) {
      setReceptionMsg(`Error: ${err.message || 'Check-in failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reception Desk Express QR Check-In Station">
      <div style={{ textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#0f766e',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '0.65rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Monitor size={16} /> RECEPTION DESK KIOSK DISPLAY MODE
        </div>

        {/* QR Display Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '2px solid var(--color-border)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          marginBottom: '1.25rem'
        }}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-primary-dark)', fontSize: '1.2rem', fontWeight: 800 }}>
            Welcome to CarePulse Health
          </h3>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
            Scan QR code with your smartphone camera to instantly set your arrival status to <strong>ARRIVED</strong>
          </p>

          {qrDataUrl ? (
            <div style={{
              display: 'inline-block',
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '3px solid #0f766e',
              boxShadow: '0 6px 16px rgba(15, 118, 110, 0.15)',
              marginBottom: '1rem'
            }}>
              <img src={qrDataUrl} alt="Reception QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
            </div>
          ) : (
            <div style={{ padding: '3rem' }}>Generating Reception QR...</div>
          )}

          <div style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '0.65rem',
            fontSize: '0.85rem',
            color: '#334155',
            fontWeight: 700
          }}>
            Station Passcode: <span style={{ color: '#0f766e', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{deskPasscode}</span>
          </div>
        </div>

        {receptionMsg && (
          <div style={{
            backgroundColor: receptionMsg.startsWith('Error') ? '#fef2f2' : '#ecfdf5',
            color: receptionMsg.startsWith('Error') ? '#991b1b' : '#047857',
            border: receptionMsg.startsWith('Error') ? '1px solid #fca5a5' : '1px solid #6ee7b7',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} /> {receptionMsg}
          </div>
        )}

        {/* Quick Receptionist Manual Patient Scanner Input */}
        <form onSubmit={handleManualScanPatient} style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            Receptionist Action: Scan / Express Arrive Patient
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Patient ID, Phone, or Name..."
              value={patientIdInput}
              onChange={e => setPatientIdInput(e.target.value)}
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }} disabled={loading}>
              <UserCheck size={16} /> Mark Arrived
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
