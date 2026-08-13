import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function EmergencyBookingModal({ isOpen, onClose, onSuccess, patientId }) {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      async function loadDepts() {
        try {
          const [deptsData, docsData] = await Promise.all([
            api.get('/departments'),
            api.get('/doctors')
          ]);
          setDepartments(deptsData || []);
          setDoctors(docsData || []);
          if (deptsData && deptsData.length > 0) {
            setSelectedDeptId(deptsData[0].id);
          }
        } catch (err) {
          console.error(err);
        }
      }
      loadDepts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDoctors = doctors.filter(d =>
    d.department_id === selectedDeptId && d.availability_status !== 'ON_LEAVE'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disclaimerAccepted) {
      setError('You must confirm the emergency medical disclaimer before booking.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeNowStr = new Date().toTimeString().split(' ')[0];

      await api.post('/appointments/emergency', {
        patient_id: patientId,
        department_id: selectedDeptId,
        doctor_id: selectedDocId || (filteredDoctors[0]?.id),
        appointment_date: todayStr,
        appointment_time: timeNowStr,
        reason: reason || 'Acute Medical Emergency',
        symptoms,
        priority: 'EMERGENCY'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit emergency booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', borderTop: '6px solid #dc2626', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
          <ShieldAlert size={28} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Request Immediate Emergency Consultation</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Priority queueing for acute symptoms</p>
          </div>
        </div>

        {/* Disclaimer box */}
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
            <AlertTriangle size={18} /> CRITICAL MEDICAL NOTICE
          </div>
          <p style={{ margin: 0, fontSize: '0.825rem', color: '#7f1d1d', lineHeight: 1.5 }}>
            You are requesting an emergency appointment slot. For life-threatening emergencies (e.g. severe chest pain, stroke symptoms, major trauma), <strong>call local emergency services (911 / 108) immediately</strong> or report directly to the nearest Emergency Room.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff1f2', color: '#be123c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Department *</label>
            <select
              className="form-select"
              value={selectedDeptId}
              onChange={e => {
                setSelectedDeptId(e.target.value);
                setSelectedDocId('');
              }}
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} Department</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Emergency Specialist (Optional)</label>
            <select
              className="form-select"
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
            >
              <option value="">-- First Available Specialist --</option>
              {filteredDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.profiles?.name || 'Dr. Specialist'} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nature of Emergency *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. High fever, acute abdominal pain, sudden allergic flare-up"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Symptoms & Vital Observations</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Describe symptoms, duration, and pain levels..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>

          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="emergency-disclaimer"
              checked={disclaimerAccepted}
              onChange={e => setDisclaimerAccepted(e.target.checked)}
              style={{ marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="emergency-disclaimer" style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', cursor: 'pointer', lineHeight: 1.4 }}>
              I acknowledge that emergency queue priority is reserved for urgent medical evaluation and does not replace ER trauma care.
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
              disabled={submitting}
            >
              {submitting ? 'Dispatching Emergency Token...' : 'Confirm Emergency Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
