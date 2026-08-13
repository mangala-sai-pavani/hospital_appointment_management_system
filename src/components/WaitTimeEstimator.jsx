import React, { useState, useEffect } from 'react';
import { Clock, Navigation, AlertCircle, Sparkles, Sliders, TrendingUp, CheckCircle, MapPin, Users } from 'lucide-react';
import { api } from '../services/api';

export default function WaitTimeEstimator({ queues = [], onAvgTimeChange }) {
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Travel time simulator state
  const [selectedDept, setSelectedDept] = useState('');
  const [travelMinutes, setTravelMinutes] = useState(25);
  const [customAvgTimes, setCustomAvgTimes] = useState({
    'Cardiology': 20,
    'Dermatology': 12,
    'Neurology': 25,
    'Pediatrics': 15,
    'General Medicine': 15
  });

  const fetchWaitTimes = async () => {
    try {
      const data = await api.get('/queue/wait-times');
      setDeptData(data || []);
      if (data && data.length > 0 && !selectedDept) {
        setSelectedDept(data[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitTimes();
  }, [queues]);

  const handleAvgTimeUpdate = (deptName, newMins) => {
    const val = Math.max(5, parseInt(newMins) || 15);
    const updated = { ...customAvgTimes, [deptName]: val };
    setCustomAvgTimes(updated);
    if (onAvgTimeChange) onAvgTimeChange(updated);
  };

  // Find department stats for selectedDept in simulator
  const currentDeptInfo = deptData.find(d => d.name === selectedDept) || {
    name: selectedDept || 'General Medicine',
    active_queue_count: 2,
    waiting_count: 2,
    avg_processing_time_mins: customAvgTimes[selectedDept] || 15
  };

  const currentAvgMins = customAvgTimes[selectedDept] || currentDeptInfo.avg_processing_time_mins || 15;
  const waitingCount = currentDeptInfo.waiting_count || 0;
  const totalWaitMins = waitingCount * currentAvgMins;

  // Calculate leave time recommendation
  const now = new Date();
  const estConsultationDate = new Date(now.getTime() + totalWaitMins * 60000);
  const recDeskArrivalDate = new Date(estConsultationDate.getTime() - 10 * 60000); // 10 mins before consultation
  const recDepartureDate = new Date(recDeskArrivalDate.getTime() - travelMinutes * 60000);

  const minsUntilDeparture = Math.round((recDepartureDate.getTime() - now.getTime()) / 60000);

  let departureAdvice = {
    status: 'OPTIMAL',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    title: 'Relax at Home • Departure On Track',
    msg: `Leave in approximately ${minsUntilDeparture} minutes at ${recDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to arrive right on time.`
  };

  if (minsUntilDeparture <= 0 && minsUntilDeparture > -15) {
    departureAdvice = {
      status: 'DEPART_NOW',
      color: '#d97706',
      bgColor: '#fffbe1',
      borderColor: '#fde68a',
      title: 'Time to Leave Now! 🚗',
      msg: `Start your trip now (${travelMinutes} min commute) to reach reception before your turn at ${estConsultationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    };
  } else if (minsUntilDeparture <= -15) {
    departureAdvice = {
      status: 'URGENT',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5',
      title: 'Head to Clinic Immediately 🚨',
      msg: `Queue is moving quickly! Doctor consultation expected at ${estConsultationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    };
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#0f766e' }} /> Real-Time Wait Time Estimator & Arrival Planner
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Based on historical average processing time per medical department
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
            <Sparkles size={12} inline="true" /> Live Pace Tracker
          </span>
        </div>
      </div>

      {/* Department Pace Cards Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {deptData.map(dept => {
          const avgMins = customAvgTimes[dept.name] || dept.avg_processing_time_mins || 15;
          const estWait = (dept.waiting_count || 0) * avgMins;
          const isSelected = selectedDept === dept.name;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDept(dept.name)}
              style={{
                backgroundColor: isSelected ? '#f0fdf4' : '#f8fafc',
                border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {dept.name}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f766e' }}>
                  ~{estWait} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>min wait</span>
                </span>
                <span className={`badge badge-${dept.queue_load === 'HEAVY' ? 'cancelled' : dept.queue_load === 'MODERATE' ? 'pending' : 'confirmed'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                  {dept.queue_load}
                </span>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>{dept.waiting_count || 0} in queue</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>{avgMins}m / patient</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Trip Departure Planner Box */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Navigation size={18} style={{ color: '#0f766e' }} /> Plan Your Arrival & Travel Commute
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Department: <strong style={{ color: '#0f766e' }}>{selectedDept || 'General Medicine'}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>
              Select Department
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.85rem' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              {deptData.map(d => (
                <option key={d.id} value={d.name}>{d.name} (~{d.avg_processing_time_mins} min/pt)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>
              Your Commute / Travel Time to Hospital
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={travelMinutes}
                onChange={e => setTravelMinutes(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#0f766e' }}
              />
              <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.9rem', minWidth: '60px' }}>
                {travelMinutes} mins
              </span>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>
              Avg Consultation Pace (Mins / Pt)
            </label>
            <input
              type="number"
              className="form-input"
              min="5"
              max="60"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
              value={currentAvgMins}
              onChange={e => handleAvgTimeUpdate(selectedDept, e.target.value)}
            />
          </div>
        </div>

        {/* Departure Advice Card */}
        <div style={{
          backgroundColor: departureAdvice.bgColor,
          border: `1.5px solid ${departureAdvice.borderColor}`,
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontWeight: 800, color: departureAdvice.color, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={18} /> {departureAdvice.title}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: departureAdvice.color }}>
              Est. Consultation Time: {estConsultationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
            {departureAdvice.msg}
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '0.25rem',
            paddingTop: '0.5rem',
            borderTop: '1px dashed rgba(0,0,0,0.1)',
            fontSize: '0.78rem',
            color: '#475569',
            flexWrap: 'wrap'
          }}>
            <div><strong>Patients Ahead:</strong> {waitingCount}</div>
            <div><strong>Est Wait:</strong> ~{totalWaitMins} mins</div>
            <div><strong>Commute:</strong> {travelMinutes} mins</div>
            <div><strong>Target Desk Arrival:</strong> {recDeskArrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
