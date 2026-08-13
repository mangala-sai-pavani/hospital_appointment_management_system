import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { Search, UserCheck, SlidersHorizontal, RotateCcw, Globe, Clock, Stethoscope, Heart, ShieldAlert, FileText } from 'lucide-react';
import '../styles/tables.css';
import '../styles/forms.css';

export default function PatientSearch() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await api.get('/patients');
        setPatients(data || []);
      } catch (err) {
        console.error('Failed to load patient directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  // Extract unique languages spoken by patients
  const availableLanguages = Array.from(
    new Set(
      patients.flatMap(p => p.languages || ['English'])
    )
  ).sort();

  // Extract unique medical specialties associated with patients
  const availableSpecialties = Array.from(
    new Set(
      patients.map(p => p.primary_specialty).filter(Boolean)
    )
  ).sort();

  // Filter patients based on criteria
  const filteredPatients = patients.filter(p => {
    // 1. Keyword search (Name, Email, Phone, Address, Diagnoses)
    const name = p.profiles?.name || '';
    const email = p.profiles?.email || '';
    const phone = p.phone || p.profiles?.phone || '';
    const addr = p.address || '';
    const diagnoses = p.medical_history?.diagnoses?.map(d => d.condition).join(' ') || '';
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch = !term ||
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      phone.includes(term) ||
      addr.toLowerCase().includes(term) ||
      diagnoses.toLowerCase().includes(term);

    // 2. Medical Specialty Filter
    const patSpecialty = p.primary_specialty || '';
    const matchesSpecialty = !selectedSpecialty ||
      patSpecialty.toLowerCase() === selectedSpecialty.toLowerCase();

    // 3. Language Spoken Filter
    const patLangs = p.languages || ['English'];
    const matchesLanguage = !selectedLanguage ||
      patLangs.some(lang => lang.toLowerCase() === selectedLanguage.toLowerCase());

    // 4. Availability Duration Filter
    const patDurationMins = p.slot_duration_mins || (p.consultation_duration ? parseInt(p.consultation_duration) : 15);
    let matchesDuration = true;
    if (selectedDuration === '15') {
      matchesDuration = patDurationMins <= 15;
    } else if (selectedDuration === '30') {
      matchesDuration = patDurationMins === 30 || patDurationMins === 20;
    } else if (selectedDuration === '45') {
      matchesDuration = patDurationMins === 45;
    } else if (selectedDuration === '60') {
      matchesDuration = patDurationMins >= 60;
    } else if (selectedDuration && !isNaN(parseInt(selectedDuration))) {
      matchesDuration = patDurationMins === parseInt(selectedDuration);
    }

    return matchesSearch && matchesSpecialty && matchesLanguage && matchesDuration;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLanguage('');
    setSelectedDuration('');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedSpecialty || selectedLanguage || selectedDuration);

  return (
    <div>
      <Navbar
        title="Patient Search Directory"
        subtitle="Search clinical patient records by specialty care needs, spoken languages, and visit duration requirements"
      />

      {/* Advanced Filter Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
            <SlidersHorizontal size={18} style={{ color: '#0f766e' }} /> Advanced Patient Search & Filter
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: '#fef2f2'
              }}
            >
              <RotateCcw size={14} /> Clear All Filters
            </button>
          )}
        </div>

        {/* Filter Inputs Grid */}
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Text Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Search Name / Email / Condition
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.88rem' }}
                placeholder="Type name, email, phone, or condition..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Primary Specialty Need
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem' }}
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
            >
              <option value="">All Care Specialties</option>
              {availableSpecialties.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Language Spoken Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Language Spoken
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem' }}
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {availableLanguages.map((lang, idx) => (
                <option key={idx} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Availability Duration Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Visit Duration Slot
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem' }}
              value={selectedDuration}
              onChange={e => setSelectedDuration(e.target.value)}
            >
              <option value="">Any Slot Duration</option>
              <option value="15">Quick Visit (≤ 15 mins)</option>
              <option value="30">Standard Visit (20 - 30 mins)</option>
              <option value="45">Extended Visit (45 mins)</option>
              <option value="60">Comprehensive Exam (60 mins)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Quick Presets:</span>

          <button
            onClick={() => { setSelectedLanguage('Spanish'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedLanguage === 'Spanish' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedLanguage === 'Spanish' ? '#f0fdf4' : '#f8fafc',
              color: selectedLanguage === 'Spanish' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌐 Spanish Speaking
          </button>

          <button
            onClick={() => { setSelectedLanguage('Mandarin'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedLanguage === 'Mandarin' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedLanguage === 'Mandarin' ? '#f0fdf4' : '#f8fafc',
              color: selectedLanguage === 'Mandarin' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌐 Mandarin Speaking
          </button>

          <button
            onClick={() => { setSelectedSpecialty('Cardiology'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedSpecialty === 'Cardiology' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedSpecialty === 'Cardiology' ? '#f0fdf4' : '#f8fafc',
              color: selectedSpecialty === 'Cardiology' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🩺 Cardiology
          </button>

          <button
            onClick={() => { setSelectedDuration('15'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedDuration === '15' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedDuration === '15' ? '#f0fdf4' : '#f8fafc',
              color: selectedDuration === '15' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⏱️ 15-Min Slots
          </button>

          <button
            onClick={() => { setSelectedDuration('30'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedDuration === '30' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedDuration === '30' ? '#f0fdf4' : '#f8fafc',
              color: selectedDuration === '30' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⏱️ 30-Min Slots
          </button>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Active Filters:</span>
            {searchTerm && (
              <span className="badge badge-pending" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                Search: "{searchTerm}" <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', color: '#000', marginLeft: '4px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </span>
            )}
            {selectedSpecialty && (
              <span className="badge badge-confirmed" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                Specialty: {selectedSpecialty} <button onClick={() => setSelectedSpecialty('')} style={{ border: 'none', background: 'none', color: '#fff', marginLeft: '4px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </span>
            )}
            {selectedLanguage && (
              <span className="badge badge-confirmed" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#0284c7' }}>
                Language: {selectedLanguage} <button onClick={() => setSelectedLanguage('')} style={{ border: 'none', background: 'none', color: '#fff', marginLeft: '4px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </span>
            )}
            {selectedDuration && (
              <span className="badge badge-confirmed" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#0f766e' }}>
                Duration: {selectedDuration} mins <button onClick={() => setSelectedDuration('')} style={{ border: 'none', background: 'none', color: '#fff', marginLeft: '4px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
          Showing <strong>{filteredPatients.length}</strong> of <strong>{patients.length}</strong> patients
        </div>
      </div>

      {/* Patients Table */}
      {loading ? (
        <div>Searching patient directory...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <UserCheck size={40} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>No patients found matching your filter criteria</h3>
          <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
            Try adjusting your search keyword, specialty requirement, or language filter.
          </p>
          <button className="btn-primary" onClick={resetFilters} style={{ margin: '0 auto' }}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Profile</th>
                <th>Care Specialty Need</th>
                <th>Languages Spoken</th>
                <th>Slot Duration</th>
                <th>DOB / Blood Group</th>
                <th>Contact & Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => {
                const patLangs = p.languages || ['English'];
                const patDurationMins = p.slot_duration_mins || (p.consultation_duration ? parseInt(p.consultation_duration) : 15);
                const diagnosesList = p.medical_history?.diagnoses || [];

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="table-patient-info">
                        <span className="patient-name">{p.profiles?.name || 'Patient'}</span>
                        <span className="patient-sub">{p.profiles?.email}</span>
                        {diagnosesList.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#0f766e', marginTop: '2px', fontWeight: 600 }}>
                            Condition: {diagnosesList[0].condition}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Specialty Care Need Tag */}
                    <td>
                      <span className="badge badge-confirmed" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}>
                        {p.primary_specialty || 'General Medicine'}
                      </span>
                    </td>

                    {/* Languages Spoken Tag */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {patLangs.map((lang, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: lang === selectedLanguage ? '#dbeafe' : '#f1f5f9',
                              border: `1px solid ${lang === selectedLanguage ? '#3b82f6' : '#cbd5e1'}`,
                              color: lang === selectedLanguage ? '#1d4ed8' : '#334155',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Globe size={11} /> {lang}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Visit Duration Tag */}
                    <td>
                      <span style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #a7f3d0',
                        color: '#047857',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Clock size={12} /> {patDurationMins} mins
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div>{p.date_of_birth || 'N/A'} ({p.gender})</div>
                        <div style={{ fontWeight: 800, color: '#dc2626' }}>Blood Group: {p.blood_group || 'N/A'}</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div><strong>Phone:</strong> {p.phone || p.profiles?.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.address || 'N/A'}</div>
                        {p.emergency_contact && (
                          <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>
                            ICE: {p.emergency_contact}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
