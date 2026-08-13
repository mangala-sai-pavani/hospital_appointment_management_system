import React, { useState, useEffect } from 'react';
import { AlertOctagon, DollarSign, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function CancelAppointmentModal({ isOpen, onClose, onSuccess, appointment }) {
  const [reason, setReason] = useState('Personal schedule conflict');
  const [refundPreview, setRefundPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && appointment) {
      const aptDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time || '09:00:00'}`);
      const now = new Date();
      const diffMs = aptDateTime.getTime() - now.getTime();
      const hoursRemaining = Math.max(0, diffMs / (1000 * 60 * 60));

      let feePercentage = 10;
      if (hoursRemaining < 2) feePercentage = 75;
      else if (hoursRemaining < 12) feePercentage = 50;
      else if (hoursRemaining < 24) feePercentage = 25;

      const baseFee = appointment.doctors?.consultation_fee || 100;
      const feeAmount = (baseFee * feePercentage) / 100;
      const refundAmount = baseFee - feeAmount;

      setRefundPreview({
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        feePercentage,
        feeAmount,
        refundAmount,
        baseFee
      });
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/appointments/${appointment.id}/cancel`, {
        reason,
        cancelled_by_role: 'PATIENT'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment.');
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
      <div className="card" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
          <AlertOctagon size={28} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Cancel Appointment</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {appointment.appointment_date} at {appointment.appointment_time} with {appointment.doctors?.profiles?.name || 'Doctor'}
            </p>
          </div>
        </div>

        {refundPreview && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} /> Refund & Processing Breakdown
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Notice</div>
                <strong>{refundPreview.hoursRemaining} Hours</strong>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cancellation Fee</div>
                <strong style={{ color: '#dc2626' }}>${refundPreview.feeAmount} ({refundPreview.feePercentage}%)</strong>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Net Refund</div>
                <strong style={{ color: '#16a34a' }}>${refundPreview.refundAmount}</strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for Cancellation *</label>
            <select
              className="form-select"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            >
              <option value="Personal schedule conflict">Personal schedule conflict</option>
              <option value="Symptoms resolved / feeling better">Symptoms resolved / feeling better</option>
              <option value="Transport / travel difficulty">Transport / travel difficulty</option>
              <option value="Booked by mistake">Booked by mistake</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
              Keep Appointment
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
              disabled={submitting}
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
