import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { Bell, Mail, MessageSquare, RefreshCw, Send, Settings, CheckCircle2, AlertCircle, Eye, Clock } from 'lucide-react';
import '../styles/tables.css';
import '../styles/forms.css';

export default function ReminderService() {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTab, setPreviewTab] = useState('email'); // 'email' or 'sms'

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    enabled: true,
    channels: 'BOTH',
    hospitalName: '',
    emailSender: '',
    smsSenderId: '',
    hospitalPhone: '',
    hospitalAddress: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, logsData, aptsData] = await Promise.all([
        api.get('/notifications/reminders/settings'),
        api.get('/notifications/reminders/logs'),
        api.get('/appointments')
      ]);

      setSettings(settingsData);
      setSettingsForm(settingsData);
      setLogs(logsData || []);
      setAppointments(aptsData || []);
    } catch (err) {
      console.error('Error loading reminder service data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerScan = async () => {
    setTriggering(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/notifications/reminders/trigger', {});
      setSuccessMsg(`24h Reminder Scan completed! Checked ${res.checkedCount || 0} upcoming visits, dispatched ${res.sentCount || 0} notification(s).`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Trigger scan failed');
    } finally {
      setTriggering(false);
    }
  };

  const handleSendSingle = async (aptId) => {
    try {
      await api.post('/notifications/reminders/send-single', { appointment_id: aptId });
      setSuccessMsg('24-Hour Reminder notification dispatched to patient!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to send reminder');
    }
  };

  const handleOpenPreview = async (aptId) => {
    try {
      const data = await api.post('/notifications/reminders/preview', { appointment_id: aptId });
      setPreviewData(data);
      setIsPreviewOpen(true);
    } catch (err) {
      alert('Failed to generate preview');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.put('/notifications/reminders/settings', settingsForm);
      setSettings(updated);
      setIsSettingsOpen(false);
      setSuccessMsg('Reminder service configuration saved!');
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // Filter 24h window appointments
  const upcoming24hApts = appointments.filter(apt => apt.status !== 'CANCELLED');

  return (
    <div>
      <Navbar
        title="24-Hour Automated Notification Service"
        subtitle="Automated email & SMS appointment reminder dispatch engine"
        actionButton={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} /> Configure Service
            </button>
            <button className="btn-primary" onClick={handleTriggerScan} disabled={triggering}>
              <RefreshCw size={16} className={triggering ? 'spin' : ''} /> {triggering ? 'Scanning...' : 'Run 24h Scan Now'}
            </button>
          </div>
        }
      />

      {successMsg && (
        <div style={{
          backgroundColor: '#e8f1f0',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary-dark)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Service Status Overview */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Automated Engine"
          value={settings?.enabled ? 'ACTIVE' : 'PAUSED'}
          subtext={`Runs every ${settings?.autoCheckIntervalMinutes || 5} minutes`}
          subtextColor={settings?.enabled ? 'positive' : 'highlight'}
        />
        <StatCard
          label="Target Lead Time"
          value={`${settings?.leadHours || 24} Hours`}
          subtext="Pre-appointment notice"
        />
        <StatCard
          label="Active Channels"
          value={settings?.channels || 'BOTH'}
          subtext="Email & SMS delivery"
          subtextColor="highlight"
        />
        <StatCard
          label="Reminders Sent"
          value={settings?.totalSentCount || logs.length}
          subtext="Total dispatched notifications"
          subtextColor="positive"
        />
      </div>

      {/* Upcoming 24h Appointments Queue */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Upcoming Appointments Queue</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Patients scheduled for consultation within the 24-hour reminder window
            </p>
          </div>
          <span className="badge badge-confirmed" style={{ fontSize: '0.8rem' }}>
            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Automated Background Monitor Active
          </span>
        </div>

        {loading ? (
          <div>Loading upcoming appointment queue...</div>
        ) : upcoming24hApts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No upcoming appointments scheduled in the system.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Doctor & Dept</th>
                  <th>Appointment Time</th>
                  <th>24h Reminder Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcoming24hApts.map(apt => (
                  <tr key={apt.id}>
                    <td>
                      <div className="table-patient-info">
                        <span className="patient-name">{apt.patients?.profiles?.name || 'Patient'}</span>
                        <span className="patient-sub">{apt.patients?.profiles?.email || 'email@example.com'} • {apt.patients?.phone || '+1-555-0301'}</span>
                      </div>
                    </td>
                    <td>
                      <div><strong>{apt.doctors?.profiles?.name || 'Doctor'}</strong></div>
                      <div className="patient-sub">{apt.departments?.name || 'Clinic'}</div>
                    </td>
                    <td>
                      <strong>{apt.appointment_date}</strong>
                      <div className="patient-sub">{apt.appointment_time}</div>
                    </td>
                    <td>
                      {apt.reminder_sent_24h ? (
                        <span className="badge badge-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Sent (Email & SMS)
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending Auto-Send
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenPreview(apt.id)}
                        >
                          <Eye size={12} /> Preview
                        </button>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleSendSingle(apt.id)}
                        >
                          <Send size={12} /> Send Now
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch History Logs */}
      <div className="card">
        <h2 className="card-title">Notification Dispatch Log</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Historical record of automated email and SMS delivery statuses
        </p>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No dispatch logs available yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Channel</th>
                  <th>Recipient</th>
                  <th>Doctor & Dept</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${log.channel === 'EMAIL' ? 'badge-info' : 'badge-confirmed'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {log.channel === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                        {log.channel}
                      </span>
                    </td>
                    <td>
                      <div><strong>{log.patient_name}</strong></div>
                      <div className="patient-sub">{log.channel === 'EMAIL' ? log.patient_email : log.patient_phone}</div>
                    </td>
                    <td>
                      <div>{log.doctor_name}</div>
                      <div className="patient-sub">{log.department}</div>
                    </td>
                    <td>
                      <span className="badge badge-confirmed">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configure 24h Reminder Service">
        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settingsForm.enabled}
                onChange={e => setSettingsForm({ ...settingsForm, enabled: e.target.checked })}
              />
              <strong>Enable Automated 24h Reminder Scheduler</strong>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Notification Channel</label>
            <select
              className="form-select"
              value={settingsForm.channels}
              onChange={e => setSettingsForm({ ...settingsForm, channels: e.target.value })}
            >
              <option value="BOTH">Email + SMS (Recommended)</option>
              <option value="EMAIL">Email Only</option>
              <option value="SMS">SMS Only</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                className="form-input"
                value={settingsForm.hospitalName}
                onChange={e => setSettingsForm({ ...settingsForm, hospitalName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={settingsForm.hospitalPhone}
                onChange={e => setSettingsForm({ ...settingsForm, hospitalPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sender Email</label>
              <input
                type="email"
                className="form-input"
                value={settingsForm.emailSender}
                onChange={e => setSettingsForm({ ...settingsForm, emailSender: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMS Sender ID</label>
              <input
                type="text"
                className="form-input"
                value={settingsForm.smsSenderId}
                onChange={e => setSettingsForm({ ...settingsForm, smsSenderId: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Save Configuration
          </button>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="24-Hour Patient Reminder Preview">
        {previewData && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <button
                className={`btn-${previewTab === 'email' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                onClick={() => setPreviewTab('email')}
              >
                <Mail size={14} /> Email HTML View
              </button>
              <button
                className={`btn-${previewTab === 'sms' ? 'primary' : 'secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                onClick={() => setPreviewTab('sms')}
              >
                <MessageSquare size={14} /> Mobile SMS View
              </button>
            </div>

            {previewTab === 'email' ? (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  <strong>Subject:</strong> {previewData.email?.subject}
                </div>
                <div
                  style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', maxHeight: '400px', overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: previewData.email?.html }}
                />
              </div>
            ) : (
              <div style={{ backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '1rem',
                  maxWidth: '320px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: '#1e293b'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    SMS Text Message
                  </div>
                  {previewData.sms?.body}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
