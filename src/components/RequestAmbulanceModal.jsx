import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertTriangle, MapPin, Navigation, Truck, ShieldAlert, CheckCircle, Clock, Info, Phone } from 'lucide-react';

export default function RequestAmbulanceModal({ isOpen, onClose, appointment, patientProfile, onSuccess }) {
  const [pickupType, setPickupType] = useState('saved'); // 'saved', 'geo', 'manual'
  const [pickupAddress, setPickupAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [geoStatus, setGeoStatus] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [assistanceRequired, setAssistanceRequired] = useState('BASIC'); // 'BASIC', 'ASSISTED'
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState(10);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  const [pricingConfig, setPricingConfig] = useState({
    base_fee: 50,
    per_km_fee: 5,
    assistance_fee: 25
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      fetchConfig();
      if (patientProfile) {
        setPickupAddress(patientProfile.address || patientProfile.pickup_address || '123 Health Ave, City Center');
        setContactNumber(patientProfile.phone || patientProfile.contact_number || '+1 (555) 019-2831');
      }
    }
  }, [isOpen, patientProfile]);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await api.get('/ambulance/config');
      if (data) setPricingConfig(data);
    } catch (err) {
      console.error('Failed to load pricing config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const handleFetchGeolocation = () => {
    setGeoStatus('Requesting browser location permission...');
    setErrorMsg('');

    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser. Please enter address manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const geoAddr = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setPickupAddress(geoAddr);
        setGeoStatus('✓ Location acquired successfully.');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoStatus('Location permission denied or unavailable. Please enter your pickup address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fee calculation
  const baseFee = Number(pricingConfig.base_fee || 50);
  const perKmFee = Number(pricingConfig.per_km_fee || 5);
  const assistanceFee = assistanceRequired === 'ASSISTED' ? Number(pricingConfig.assistance_fee || 25) : 0;
  const distanceFee = estimatedDistance * perKmFee;
  const estimatedTotal = baseFee + distanceFee + assistanceFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disclaimerAgreed) {
      setErrorMsg('You must acknowledge the non-emergency disclaimer before submitting.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMsg('Please provide a valid pickup address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/ambulance/requests', {
        appointment_id: appointment.id,
        pickup_address: pickupAddress,
        pickup_latitude: latitude,
        pickup_longitude: longitude,
        destination: `CarePulse Central Hospital (${appointment.departments?.name || 'Main Wing'})`,
        assistance_required: assistanceRequired,
        reason: reason || 'Hospital appointment transport request',
        contact_number: contactNumber,
        estimated_distance: estimatedDistance,
        notes: notes,
        disclaimer_acknowledged: true
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit ambulance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--color-border)',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f766e',
          color: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Request Hospital Ambulance Transport</h3>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Non-emergency patient transportation service</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.8 }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* CRITICAL SAFETY DISCLAIMER */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.85rem'
          }}>
            <ShieldAlert size={26} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                IMPORTANT EMERGENCY SAFETY RULE
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '0.85rem', lineHeight: 1.4 }}>
                <strong>For life-threatening emergencies, contact your local emergency medical services (911) immediately. Do not rely on this application for emergency response.</strong>
              </div>
              <div style={{ color: '#991b1b', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                This service is for hospital-arranged scheduled transportation, subject to hospital availability and confirmation.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Appointment Context Summary */}
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.85rem'
          }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Doctor & Department</span>
              <strong>{appointment.doctors?.profiles?.name || 'Dr. Specialist'}</strong> ({appointment.departments?.name || 'General'})
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Appointment Date & Time</span>
              <strong>{appointment.appointment_date}</strong> at <strong>{appointment.appointment_time}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Destination</span>
              <strong>CarePulse Main Medical Center</strong>
            </div>
          </div>

          {/* Pickup Location Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              1. Pickup Location
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-secondary ${pickupType === 'saved' ? 'active' : ''}`}
                style={{
                  backgroundColor: pickupType === 'saved' ? '#0f766e' : 'transparent',
                  color: pickupType === 'saved' ? '#ffffff' : 'var(--color-text)',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem'
                }}
                onClick={() => {
                  setPickupType('saved');
                  setPickupAddress(patientProfile?.address || '123 Health Ave, City Center');
                }}
              >
                <MapPin size={14} /> Saved Patient Address
              </button>

              <button
                type="button"
                className={`btn-secondary ${pickupType === 'geo' ? 'active' : ''}`}
                style={{
                  backgroundColor: pickupType === 'geo' ? '#0f766e' : 'transparent',
                  color: pickupType === 'geo' ? '#ffffff' : 'var(--color-text)',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem'
                }}
                onClick={() => {
                  setPickupType('geo');
                  handleFetchGeolocation();
                }}
              >
                <Navigation size={14} /> Use Current Browser Location
              </button>

              <button
                type="button"
                className={`btn-secondary ${pickupType === 'manual' ? 'active' : ''}`}
                style={{
                  backgroundColor: pickupType === 'manual' ? '#0f766e' : 'transparent',
                  color: pickupType === 'manual' ? '#ffffff' : 'var(--color-text)',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem'
                }}
                onClick={() => setPickupType('manual')}
              >
                ✏️ Manual Entry
              </button>
            </div>

            {geoStatus && (
              <div style={{ fontSize: '0.8rem', color: '#0369a1', marginBottom: '0.5rem', fontWeight: 600 }}>
                {geoStatus}
              </div>
            )}

            <input
              type="text"
              className="form-control"
              placeholder="Full pickup street address, building, apartment number"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px' }}
            />
          </div>

          {/* Contact Number & Reason */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Contact Phone Number
              </label>
              <input
                type="tel"
                className="form-control"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Assistance Level Required
              </label>
              <select
                className="form-control"
                value={assistanceRequired}
                onChange={(e) => setAssistanceRequired(e.target.value)}
                style={{ width: '100%', padding: '0.6rem' }}
              >
                <option value="BASIC">Basic Transport (Standard Seating / Ambulatory)</option>
                <option value="ASSISTED">Assisted Transport (Wheelchair / Stretcher / Paramedic Helper +$25)</option>
              </select>
            </div>
          </div>

          {/* Reason & Notes */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
              Reason for Transport Request & Mobility Notes
            </label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="e.g., Difficulty walking long distances after cardiac procedure, needs wheelchair assistance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
            ></textarea>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Note: Do NOT store sensitive medical history in free-text fields.
            </span>
          </div>

          {/* Distance & Fee Preview */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                Estimated Ambulance Charges
              </span>
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontStyle: 'italic' }}>
                Subject to confirmation
              </span>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#166534', marginBottom: '0.25rem' }}>
                <span>Estimated Distance: <strong>{estimatedDistance} km</strong></span>
                <span>${perKmFee.toFixed(2)} / km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={estimatedDistance}
                onChange={(e) => setEstimatedDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#16a34a' }}
              />
            </div>

            <div style={{ borderTop: '1px dashed #86efac', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#166534' }}>
                <span>Base Dispatch Fee:</span>
                <span>${baseFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#166534' }}>
                <span>Distance Fee ({estimatedDistance} km):</span>
                <span>${distanceFee.toFixed(2)}</span>
              </div>
              {assistanceRequired === 'ASSISTED' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#166534' }}>
                  <span>Assistance Fee:</span>
                  <span>${assistanceFee.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid #4ade80',
                fontWeight: 800,
                color: '#14532d',
                fontSize: '1.05rem'
              }}>
                <span>Estimated Total Fee:</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '0.5rem 0 0 0', lineHeight: 1.3 }}>
              "Estimated ambulance charges may apply and are subject to hospital/ambulance availability and applicable rates."
            </p>
          </div>

          {/* Mandatory Disclaimer Acknowledgement */}
          <div style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={disclaimerAgreed}
                onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#0f766e' }}
              />
              <span>
                <strong>Patient Acknowledgement:</strong> "I understand that ambulance transportation may incur additional charges and is subject to hospital/receptionist confirmation and ambulance vehicle availability."
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#0f766e', minWidth: '180px' }}
              disabled={submitting || !disclaimerAgreed}
            >
              {submitting ? 'Submitting Request...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
