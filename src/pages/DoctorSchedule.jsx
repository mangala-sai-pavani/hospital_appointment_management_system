import React from 'react';
import Navbar from '../components/Navbar';
import { Calendar, Clock } from 'lucide-react';

export default function DoctorSchedule() {
  const days = [
    { day: 'MONDAY', start: '09:00 AM', end: '01:00 PM', duration: '30 mins', active: true },
    { day: 'TUESDAY', start: '10:00 AM', end: '04:00 PM', duration: '30 mins', active: true },
    { day: 'WEDNESDAY', start: '09:00 AM', end: '01:00 PM', duration: '30 mins', active: true },
    { day: 'THURSDAY', start: '10:00 AM', end: '04:00 PM', duration: '30 mins', active: true },
    { day: 'FRIDAY', start: '09:00 AM', end: '01:00 PM', duration: '30 mins', active: true },
    { day: 'SATURDAY', start: 'Off Day', end: '-', duration: '-', active: false },
    { day: 'SUNDAY', start: 'Off Day', end: '-', duration: '-', active: false }
  ];

  return (
    <div>
      <Navbar title="My Weekly Schedule" subtitle="Availability slots for appointment booking" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {days.map(d => (
          <div key={d.day} className="card" style={{ opacity: d.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--color-primary-dark)' }}>{d.day}</h3>
              <span className={`badge ${d.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                {d.active ? 'Active' : 'Off'}
              </span>
            </div>

            {d.active ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><Clock size={14} style={{ display: 'inline', marginRight: '6px' }} /> {d.start} - {d.end}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Slot Duration: {d.duration}</div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No consultation slots</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
