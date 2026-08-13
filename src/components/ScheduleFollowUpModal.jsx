import React, { useState } from 'react';
import { Calendar, PlusCircle, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function ScheduleFollowUpModal({ isOpen, onClose, onSuccess, appointment }) {
  const [followUpDate, setFollowUpDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState('10:00:00');
  const [reason, setReason] = useState('Post-treatment evaluation & prescription review');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/appointments/${appointment.id}/follow-up`, {
        follow_up_date: followUpDate,
        follow_up_time: followUpTime,
        reason,
        notes
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule follow-up.');
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
      <div className="card" style={{ maxWidth: '540px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <PlusCircle size={26} style={{ color: 'var(--color-primary-dark)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Schedule Follow-Up Consultation</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Patient: {appointment.patients?.profiles?.name || 'Patient'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Follow-Up Date *</label>
            <input
              type="date"
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Follow-Up Time *</label>
            <select
              className="form-select"
              value={followUpTime}
              onChange={e => setFollowUpTime(e.target.value)}
              required
            >
              <option value="09:00:00">09:00 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="11:00:00">11:00 AM</option>
              <option value="14:00:00">02:00 PM</option>
              <option value="15:00:00">03:00 PM</option>
              <option value="16:00:00">04:00 PM</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Follow-Up *</label>
            <input
              type="text"
              className="form-input"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Clinical Notes for Patient</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="E.g. Repeat blood test before arrival, continue medication..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Follow-Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
