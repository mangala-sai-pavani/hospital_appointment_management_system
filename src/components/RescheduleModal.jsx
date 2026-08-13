import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle, X } from 'lucide-react';
import { api } from '../services/api';

const TIME_SLOTS = [
  '09:00:00', '09:30:00', '10:00:00', '10:30:00', 
  '11:00:00', '11:30:00', '14:00:00', '14:30:00', 
  '15:00:00', '15:30:00', '16:00:00', '16:30:00'
];

export default function RescheduleModal({ isOpen, onClose, onSuccess, appointment }) {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('');
  const [existingBookedSlots, setExistingBookedSlots] = useState([]);
  
  const [policyPreview, setPolicyPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && appointment) {
      // Calculate hours remaining and policy fee preview
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

      setPolicyPreview({
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        feePercentage,
        feeAmount,
        refundAmount,
        baseFee
      });
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!isOpen || !appointment || !newDate) return;
    async function fetchBookedSlots() {
      try {
        const apts = await api.get(`/appointments?doctor_id=${appointment.doctor_id}&date=${newDate}`);
        const booked = (apts || [])
          .filter(a => a.id !== appointment.id && a.status !== 'CANCELLED')
          .map(a => a.appointment_time);
        setExistingBookedSlots(booked);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBookedSlots();
  }, [isOpen, appointment, newDate]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTime) {
      setError('Please select a new time slot.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/appointments/${appointment.id}/reschedule`, {
        new_date: newDate,
        new_time: newTime,
        doctor_id: appointment.doctor_id
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (timeStr) => {
    const [hrs, mins] = timeStr.split(':');
    const h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${mins} ${ampm}`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '620px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Calendar size={24} style={{ color: 'var(--color-primary-dark)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Reschedule Appointment</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Current: {appointment.appointment_date} at {appointment.appointment_time} with {appointment.doctors?.profiles?.name || 'Doctor'}
            </p>
          </div>
        </div>

        {/* Reschedule Fee Policy Card */}
        {policyPreview && (
          <div style={{ backgroundColor: 'var(--color-subtle-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} /> Rescheduling Policy Calculation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Notice Period</div>
                <strong>{policyPreview.hoursRemaining} Hours</strong>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Processing Fee</div>
                <strong style={{ color: '#dc2626' }}>${policyPreview.feeAmount} ({policyPreview.feePercentage}%)</strong>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fee Credit</div>
                <strong style={{ color: '#16a34a' }}>${policyPreview.refundAmount}</strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select New Date *</label>
            <input
              type="date"
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={e => {
                setNewDate(e.target.value);
                setNewTime('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Available Time Slot *</label>
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => {
                const isBooked = existingBookedSlots.includes(slot);
                const isSelected = newTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    className={`slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'disabled' : ''}`}
                    onClick={() => setNewTime(slot)}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating Slot...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
