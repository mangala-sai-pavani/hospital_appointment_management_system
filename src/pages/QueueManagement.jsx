import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DeskQRCodeDisplayModal from '../components/DeskQRCodeDisplayModal';
import { api } from '../services/api';
import { RefreshCw, Phone, CheckCircle, QrCode, UserCheck, MapPin, Sparkles } from 'lucide-react';
import '../styles/queue.css';

export default function QueueManagement() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeskQrOpen, setIsDeskQrOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

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

  const handleUpdate = async (id, status) => {
    try {
      if (status === 'CALLED') await api.put(`/queue/${id}/call`, {});
      if (status === 'COMPLETED') await api.put(`/queue/${id}/complete`, {});
      fetchQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredQueues = queues.filter(q => activeFilter === 'ALL' || q.status === activeFilter);

  const arrivedCount = queues.filter(q => q.status === 'ARRIVED').length;

  return (
    <div>
      <Navbar
        title="Reception Desk Queue Control"
        subtitle="Manage live token flow, desk QR check-ins, and doctor consultations"
        actionButton={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ backgroundColor: '#0f766e' }} onClick={() => setIsDeskQrOpen(true)}>
              <QrCode size={16} /> Reception Desk QR Kiosk
            </button>
            <button className="btn-secondary" onClick={fetchQueue}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        }
      />

      {/* Desk Status Alert Banner */}
      <div className="card" style={{ marginBottom: '1.25rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
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
              <UserCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#047857', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Desk Express Check-In Active <Sparkles size={16} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                Patients can scan the desk QR code to instantly update status to <strong>ARRIVED</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Arrived at Desk</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857' }}>{arrivedCount}</div>
            </div>
            <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => setIsDeskQrOpen(true)}>
              Display Station QR
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['ALL', 'ARRIVED', 'WAITING', 'CALLED', 'COMPLETED'].map(status => (
          <button
            key={status}
            className={`btn-secondary ${activeFilter === status ? 'active' : ''}`}
            style={{
              backgroundColor: activeFilter === status ? 'var(--color-primary-dark)' : 'var(--color-card-bg)',
              color: activeFilter === status ? '#ffffff' : 'var(--color-primary-dark)',
              borderColor: activeFilter === status ? 'var(--color-primary-dark)' : 'var(--color-border)',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem'
            }}
            onClick={() => setActiveFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading live token queue...</div>
      ) : filteredQueues.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No queue entries matching status "{activeFilter}".
        </div>
      ) : (
        <div className="queue-container">
          {filteredQueues.map(q => (
            <div
              key={q.id}
              className={`queue-card status-${q.status?.toLowerCase()}`}
              style={{
                borderLeft: q.status === 'ARRIVED' ? '5px solid #10b981' : undefined,
                backgroundColor: q.status === 'ARRIVED' ? '#f0fdf4' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="queue-number-badge" style={{ backgroundColor: q.status === 'ARRIVED' ? '#10b981' : undefined, color: q.status === 'ARRIVED' ? '#ffffff' : undefined }}>
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
                  </div>
                  <div className="queue-dept">Doctor: {q.doctors?.profiles?.name || 'Dr. Specialist'}</div>
                  {q.arrived_at && (
                    <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                      Arrived at: {new Date(q.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge ${q.status === 'ARRIVED' ? 'badge-confirmed' : `badge-${q.status?.toLowerCase()}`}`} style={{ backgroundColor: q.status === 'ARRIVED' ? '#10b981' : undefined, color: '#ffffff' }}>
                  {q.status}
                </span>

                <div className="queue-action-btns">
                  {(q.status === 'ARRIVED' || q.status === 'WAITING') && (
                    <button className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleUpdate(q.id, 'CALLED')}>
                      <Phone size={14} /> Call Token
                    </button>
                  )}
                  {q.status === 'CALLED' && (
                    <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleUpdate(q.id, 'COMPLETED')}>
                      <CheckCircle size={14} /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desk QR Display Modal */}
      <DeskQRCodeDisplayModal
        isOpen={isDeskQrOpen}
        onClose={() => setIsDeskQrOpen(false)}
        onRefreshQueue={fetchQueue}
      />
    </div>
  );
}

