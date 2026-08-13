import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PatientQRCheckInModal from '../components/PatientQRCheckInModal';
import WaitTimeEstimator from '../components/WaitTimeEstimator';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw, QrCode, Sparkles, UserCheck, Timer, Calendar, MapPin } from 'lucide-react';
import '../styles/queue.css';

const DEFAULT_DEPT_MINUTES = {
  'Cardiology': 20,
  'Dermatology': 12,
  'Neurology': 25,
  'Pediatrics': 15,
  'General Medicine': 15,
  'default': 15
};

export default function QueueStatus() {
  const { profile } = useAuth();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [customPaces, setCustomPaces] = useState(DEFAULT_DEPT_MINUTES);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.get('/queue');
      setQueues(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div>
      <Navbar
        title="Live Token Queue Status"
        subtitle="Real-time wait time estimator, desk arrivals & token flow"
        actionButton={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
              <QrCode size={16} /> Scan Desk QR
            </button>
            <button className="btn-secondary" onClick={fetchQueue}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        }
      />

      {/* Reception Desk Arrival Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '2.8rem',
              height: '2.8rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#047857', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Reception Desk QR Station Active <Sparkles size={16} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                At the waiting lobby? Scan the desk QR code to announce your arrival and activate your queue token.
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
            <QrCode size={16} /> Scan Desk QR to Arrive
          </button>
        </div>
      </div>

      {/* Real-Time Wait Time Estimator & Trip Planner */}
      <WaitTimeEstimator queues={queues} onAvgTimeChange={(updated) => setCustomPaces(updated)} />

      {loading ? (
        <div>Loading live token queues...</div>
      ) : queues.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <Clock size={36} style={{ marginBottom: '0.75rem', color: 'var(--color-primary)' }} />
          <div>No active queue tokens for today. Scan the reception desk QR code or check in from "My Appointments".</div>
          <button className="btn-primary" style={{ marginTop: '1rem', backgroundColor: '#0f766e' }} onClick={() => setIsQrModalOpen(true)}>
            <QrCode size={16} /> Open QR Desk Scanner
          </button>
        </div>
      ) : (
        <div className="queue-container">
          {queues.map((q, idx) => {
            const deptName = q.departments?.name || q.doctors?.departments?.name || 'General Medicine';
            const avgPace = customPaces[deptName] || DEFAULT_DEPT_MINUTES[deptName] || 15;

            // Calculate patients ahead for this doctor/department
            const patientsAhead = queues.slice(0, idx).filter(item =>
              ['WAITING', 'ARRIVED'].includes(item.status) &&
              (item.doctor_id === q.doctor_id || item.departments?.name === deptName)
            ).length;

            const isCurrent = q.status === 'CALLED' || q.status === 'IN_PROGRESS';
            const estWaitMins = isCurrent ? 0 : patientsAhead * avgPace;

            const now = new Date();
            const estTurnDate = new Date(now.getTime() + estWaitMins * 60000);
            const recDeskDate = new Date(estTurnDate.getTime() - 10 * 60000);

            // Progress percentage
            const totalInDept = queues.filter(item => item.departments?.name === deptName || item.doctor_id === q.doctor_id).length;
            const progressPct = totalInDept > 0 ? Math.round(((totalInDept - patientsAhead) / totalInDept) * 100) : 100;

            return (
              <div
                key={q.id}
                className={`queue-card status-${q.status?.toLowerCase()}`}
                style={{
                  borderLeft: q.status === 'ARRIVED' ? '5px solid #10b981' : isCurrent ? '5px solid #3b82f6' : undefined,
                  backgroundColor: q.status === 'ARRIVED' ? '#f0fdf4' : isCurrent ? '#eff6ff' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      className="queue-number-badge"
                      style={{
                        backgroundColor: q.status === 'ARRIVED' ? '#10b981' : isCurrent ? '#3b82f6' : undefined,
                        color: (q.status === 'ARRIVED' || isCurrent) ? '#ffffff' : undefined
                      }}
                    >
                      #{q.queue_number}
                    </div>
                    <div>
                      <div className="queue-patient-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {q.patients?.profiles?.name || 'Patient'}
                        {q.status === 'ARRIVED' && (
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                            ✓ AT RECEPTION
                          </span>
                        )}
                        {isCurrent && (
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                            ▶ IN CONSULTATION NOW
                          </span>
                        )}
                      </div>
                      <div className="queue-dept">
                        Doctor: <strong>{q.doctors?.profiles?.name || 'Consultant'}</strong> • {deptName}
                      </div>
                      {q.arrived_at && (
                        <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                          Arrived at reception: {new Date(q.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Est Wait Time Pill */}
                    <div style={{
                      backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                      border: `1px solid ${isCurrent ? '#bfdbfe' : '#cbd5e1'}`,
                      borderRadius: '12px',
                      padding: '0.4rem 0.85rem',
                      textAlign: 'right'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Estimated Wait
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: isCurrent ? '#1d4ed8' : '#0f766e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Timer size={14} /> {isCurrent ? 'Current Turn' : `~${estWaitMins} mins`}
                      </div>
                    </div>

                    <span className={`badge ${q.status === 'ARRIVED' ? 'badge-confirmed' : `badge-${q.status?.toLowerCase()}`}`} style={{ backgroundColor: q.status === 'ARRIVED' ? '#10b981' : undefined, color: '#ffffff', fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                      {q.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Patient Wait Time Breakdown Bar */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#334155',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong>Pace:</strong> {avgPace} mins/pt
                  </div>
                  <div>
                    <strong>Queue Position:</strong> {patientsAhead === 0 ? (isCurrent ? 'Being Seen' : 'Next in Line') : `${patientsAhead} patient(s) ahead`}
                  </div>
                  <div>
                    <strong>Est. Turn Time:</strong> {estTurnDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: '#0f766e', fontWeight: 700 }}>
                    <strong>Plan Desk Arrival:</strong> {recDeskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Queue Position Visual Bar */}
                {!isCurrent && (
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, backgroundColor: '#0f766e', height: '100%', transition: 'width 0.4s ease' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Patient QR Check-In Modal */}
      <PatientQRCheckInModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onCheckInSuccess={() => fetchQueue()}
      />
    </div>
  );
}


