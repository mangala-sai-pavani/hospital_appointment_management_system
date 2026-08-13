import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { Phone, CheckCircle, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import '../styles/queue.css';

export default function DoctorQueue() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCall = async (id) => {
    try {
      await api.put(`/queue/${id}/call`, {});
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Call failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/queue/${id}/complete`, {});
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Complete failed');
    }
  };

  return (
    <div>
      <Navbar
        title="Live Consultation Queue Manager"
        subtitle="Manage active tokens, call-ins, and priority emergencies"
        actionButton={
          <button className="btn-secondary" onClick={fetchQueue}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      {loading ? (
        <div>Loading token queue...</div>
      ) : queues.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No patients currently waiting in the consultation queue.
        </div>
      ) : (
        <div className="queue-container">
          {queues.map(q => {
            const priority = q.priority || q.appointments?.priority || 'NORMAL';
            const isEmergency = priority === 'EMERGENCY';

            return (
              <div
                key={q.id}
                className={`queue-card status-${q.status}`}
                style={isEmergency ? { borderLeft: '6px solid #dc2626', backgroundColor: '#fef2f2' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="queue-number-badge" style={isEmergency ? { backgroundColor: '#dc2626', color: '#ffffff' } : {}}>
                    #{q.queue_number}
                  </div>
                  <div>
                    <div className="queue-patient-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {q.patients?.profiles?.name || 'Patient'}
                      {isEmergency && (
                        <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                          🚨 EMERGENCY
                        </span>
                      )}
                    </div>
                    <div className="queue-dept">
                      Reason: {q.appointments?.reason || 'Consultation'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge badge-${q.status.toLowerCase()}`}>
                    {q.status.replace('_', ' ')}
                  </span>

                  <div className="queue-action-btns">
                    {(q.status === 'ARRIVED' || q.status === 'WAITING') && (
                      <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', backgroundColor: isEmergency ? '#dc2626' : undefined }} onClick={() => handleCall(q.id)}>
                        <Phone size={14} /> Call Patient
                      </button>
                    )}
                    {(q.status === 'CALLED' || q.status === 'IN_PROGRESS') && (
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.85rem', backgroundColor: '#10b981', color: '#ffffff' }} onClick={() => handleComplete(q.id)}>
                        <CheckCircle size={14} /> Complete Consultation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
