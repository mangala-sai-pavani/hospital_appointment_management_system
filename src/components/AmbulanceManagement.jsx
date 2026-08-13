import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, DollarSign, BarChart2, Plus, Edit2, Phone, MapPin, UserCheck } from 'lucide-react';
import '../styles/tables.css';

export default function AmbulanceManagement() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'fleet', 'config', 'analytics'
  const [requests, setRequests] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [config, setConfig] = useState({ base_fee: 50, per_km_fee: 5, assistance_fee: 25 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [assignModalReq, setAssignModalReq] = useState(null);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');

  const [statusModalReq, setStatusModalReq] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [statusNotes, setStatusNotes] = useState('');
  const [finalFee, setFinalFee] = useState('');

  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    ambulance_type: 'BASIC',
    status: 'AVAILABLE',
    driver_name: '',
    contact_number: ''
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, ambData, cfgData, anaData] = await Promise.all([
        api.get('/ambulance/requests'),
        api.get('/ambulance/vehicles'),
        api.get('/ambulance/config'),
        isAdmin ? api.get('/ambulance/analytics') : Promise.resolve(null)
      ]);

      setRequests(reqData || []);
      setAmbulances(ambData || []);
      if (cfgData) setConfig(cfgData);
      if (anaData) setAnalytics(anaData);
    } catch (err) {
      console.error('Failed to fetch ambulance management data:', err);
      setMsg({ type: 'error', text: 'Failed to load ambulance data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/ambulance/config', config);
      setMsg({ type: 'success', text: 'Ambulance pricing configuration updated successfully.' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update configuration.' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAmbulanceId) return;

    try {
      await api.put(`/ambulance/requests/${assignModalReq.id}/assign`, {
        ambulance_id: selectedAmbulanceId
      });
      setMsg({ type: 'success', text: 'Ambulance vehicle assigned successfully.' });
      setAssignModalReq(null);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to assign ambulance vehicle.' });
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/ambulance/requests/${statusModalReq.id}/status`, {
        status: newStatus,
        notes: statusNotes,
        final_fee: finalFee ? Number(finalFee) : undefined
      });
      setMsg({ type: 'success', text: `Request status updated to ${newStatus}.` });
      setStatusModalReq(null);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update request status.' });
    }
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ambulance/vehicles', newVehicle);
      setMsg({ type: 'success', text: 'New ambulance vehicle added to fleet.' });
      setAddVehicleModalOpen(false);
      setNewVehicle({ vehicle_number: '', ambulance_type: 'BASIC', status: 'AVAILABLE', driver_name: '', contact_number: '' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to add ambulance vehicle.' });
    }
  };

  const handleVehicleStatusChange = async (vehicleId, status) => {
    try {
      await api.put(`/ambulance/vehicles/${vehicleId}`, { status });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update vehicle status.');
    }
  };

  const filteredRequests = requests.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={24} /> Hospital Ambulance Transport Management
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Hospital-arranged non-emergency patient transportation & dispatch control
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAdmin && (
            <button
              className="btn-primary"
              style={{ backgroundColor: '#0f766e', fontSize: '0.85rem' }}
              onClick={() => setAddVehicleModalOpen(true)}
            >
              <Plus size={16} /> Add Vehicle to Fleet
            </button>
          )}
        </div>
      </div>

      {msg.text && (
        <div style={{
          backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: msg.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontWeight: 600,
          fontSize: '0.85rem'
        }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn-secondary ${activeTab === 'requests' ? 'active' : ''}`}
          style={{
            borderBottom: activeTab === 'requests' ? '3px solid #0f766e' : 'none',
            borderRadius: '0',
            fontWeight: 700
          }}
          onClick={() => setActiveTab('requests')}
        >
          🚑 Transport Requests ({requests.length})
        </button>

        <button
          className={`btn-secondary ${activeTab === 'fleet' ? 'active' : ''}`}
          style={{
            borderBottom: activeTab === 'fleet' ? '3px solid #0f766e' : 'none',
            borderRadius: '0',
            fontWeight: 700
          }}
          onClick={() => setActiveTab('fleet')}
        >
          🛞 Ambulance Fleet ({ambulances.length})
        </button>

        {isAdmin && (
          <>
            <button
              className={`btn-secondary ${activeTab === 'config' ? 'active' : ''}`}
              style={{
                borderBottom: activeTab === 'config' ? '3px solid #0f766e' : 'none',
                borderRadius: '0',
                fontWeight: 700
              }}
              onClick={() => setActiveTab('config')}
            >
              ⚙️ Pricing & Rates
            </button>

            <button
              className={`btn-secondary ${activeTab === 'analytics' ? 'active' : ''}`}
              style={{
                borderBottom: activeTab === 'analytics' ? '3px solid #0f766e' : 'none',
                borderRadius: '0',
                fontWeight: 700
              }}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Revenue & Analytics
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div>Loading ambulance data...</div>
      ) : activeTab === 'requests' ? (
        /* Requests View */
        <div>
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['ALL', 'REQUESTED', 'UNDER_REVIEW', 'CONFIRMED', 'AMBULANCE_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'REJECTED'].map(st => (
              <button
                key={st}
                className="btn-secondary"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  backgroundColor: statusFilter === st ? '#0f766e' : 'transparent',
                  color: statusFilter === st ? '#ffffff' : 'var(--color-text)'
                }}
                onClick={() => setStatusFilter(st)}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Appointment Details</th>
                  <th>Pickup Address</th>
                  <th>Assistance</th>
                  <th>Est. Charge</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No ambulance requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.patients?.name || 'Patient'}</strong>
                        <div className="patient-sub"><Phone size={12} /> {req.patients?.phone || req.contact_number}</div>
                      </td>
                      <td>
                        {req.appointments ? (
                          <div>
                            <div><strong>{req.appointments.doctor_name}</strong></div>
                            <div className="patient-sub">{req.appointments.appointment_date} @ {req.appointments.appointment_time}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>Direct Transfer</span>
                        )}
                      </td>
                      <td>
                        <div style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {req.pickup_address}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: req.assistance_required === 'ASSISTED' ? '#eff6ff' : '#f3f4f6',
                          color: req.assistance_required === 'ASSISTED' ? '#1d4ed8' : '#374151'
                        }}>
                          {req.assistance_required}
                        </span>
                      </td>
                      <td>
                        <strong>${Number(req.final_fee || req.estimated_fee || 0).toFixed(2)}</strong>
                        <div className="patient-sub">{req.estimated_distance} km</div>
                      </td>
                      <td>
                        {req.ambulances ? (
                          <div>
                            <strong>{req.ambulances.vehicle_number}</strong>
                            <div className="patient-sub">{req.ambulances.driver_name}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#d97706', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${req.status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#0f766e' }}
                            onClick={() => {
                              setAssignModalReq(req);
                              setSelectedAmbulanceId(req.ambulance_id || '');
                            }}
                          >
                            Assign Vehicle
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setStatusModalReq(req);
                              setNewStatus(req.status);
                              setStatusNotes(req.notes || '');
                              setFinalFee(req.final_fee || req.estimated_fee || '');
                            }}
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'fleet' ? (
        /* Fleet View */
        <div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle No.</th>
                  <th>Type</th>
                  <th>Driver Name</th>
                  <th>Driver Contact</th>
                  <th>Base Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ambulances.map(amb => (
                  <tr key={amb.id}>
                    <td><strong>{amb.vehicle_number}</strong></td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        {amb.ambulance_type}
                      </span>
                    </td>
                    <td>{amb.driver_name}</td>
                    <td>{amb.contact_number}</td>
                    <td>${Number(amb.base_fee || 50).toFixed(2)}</td>
                    <td>
                      <select
                        value={amb.status}
                        onChange={(e) => handleVehicleStatusChange(amb.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="EN_ROUTE">EN_ROUTE</option>
                        <option value="ON_TRIP">ON_TRIP</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                      </select>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Auto-sync</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'config' ? (
        /* Config View */
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#0f766e' }}>
            Ambulance Service Rates Configuration
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Configure default fees used to calculate estimated ambulance transportation charges for patients.
          </p>

          <form onSubmit={handleSaveConfig}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Base Dispatch Fee ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={config.base_fee}
                onChange={(e) => setConfig({ ...config, base_fee: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Per-Kilometre Rate ($/km)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={config.per_km_fee}
                onChange={(e) => setConfig({ ...config, per_km_fee: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Assistance Fee ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={config.assistance_fee}
                onChange={(e) => setConfig({ ...config, assistance_fee: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Applied when patient selects Assisted Transport (Wheelchair/Paramedic)
              </span>
            </div>

            <button type="submit" className="btn-primary" style={{ backgroundColor: '#0f766e' }} disabled={savingConfig}>
              {savingConfig ? 'Saving Rates...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      ) : activeTab === 'analytics' && analytics ? (
        /* Analytics View */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid #0f766e' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>TOTAL REQUESTS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.total_requests}</div>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>{analytics.confirmed_requests} Confirmed / Active</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>COMPLETED TRANSPORTS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.completed_requests}</div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Successfully Delivered</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>TOTAL AMBULANCE REVENUE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: '#4338ca' }}>${analytics.total_revenue}</div>
              <div style={{ fontSize: '0.75rem', color: '#4f46e5' }}>Avg Charge: ${analytics.avg_charge}</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>FLEET UTILIZATION RATE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0', color: '#d97706' }}>{analytics.utilization_rate}</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{analytics.active_ambulances} / {analytics.total_ambulances} Vehicles Active</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Assign Vehicle Modal */}
      {assignModalReq && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#0f766e' }}>
              Assign Ambulance Vehicle
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Select an available ambulance vehicle from the hospital fleet for <strong>{assignModalReq.patients?.name}</strong>.
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Available Ambulance</label>
                <select
                  className="form-control"
                  value={selectedAmbulanceId}
                  onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Ambulance Vehicle --</option>
                  {ambulances.map(amb => (
                    <option key={amb.id} value={amb.id} disabled={amb.status !== 'AVAILABLE' && assignModalReq.ambulance_id !== amb.id}>
                      {amb.vehicle_number} ({amb.ambulance_type}) - Driver: {amb.driver_name} [{amb.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setAssignModalReq(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0f766e' }} disabled={!selectedAmbulanceId}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModalReq && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#0f766e' }}>
              Update Transport Status
            </h3>

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>New Status</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="AMBULANCE_ASSIGNED">AMBULANCE_ASSIGNED</option>
                  <option value="EN_ROUTE">EN_ROUTE</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {newStatus === 'COMPLETED' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Final Confirmed Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={finalFee}
                    onChange={(e) => setFinalFee(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Staff Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Patient picked up smoothly at 09:15 AM."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setStatusModalReq(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0f766e' }}>Save Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {addVehicleModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#0f766e' }}>
              Add Ambulance to Hospital Fleet
            </h3>

            <form onSubmit={handleAddVehicleSubmit}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Vehicle Plate Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AMB-CP-04"
                  value={newVehicle.vehicle_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Ambulance Type</label>
                <select
                  className="form-control"
                  value={newVehicle.ambulance_type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, ambulance_type: e.target.value })}
                >
                  <option value="BASIC">BASIC (Standard Transport)</option>
                  <option value="ASSISTED">ASSISTED (Paramedic Support)</option>
                  <option value="ADVANCED">ADVANCED (ICU Support)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Driver Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newVehicle.driver_name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={newVehicle.contact_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, contact_number: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setAddVehicleModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0f766e' }}>Add Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
