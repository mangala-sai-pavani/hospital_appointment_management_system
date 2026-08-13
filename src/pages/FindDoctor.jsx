import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { Search, UserCheck, Calendar, Globe, Clock, Stethoscope, SlidersHorizontal, RotateCcw, CheckCircle, Award } from 'lucide-react';
import '../styles/tables.css';
import '../styles/forms.css';

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [docsData, deptsData] = await Promise.all([
          api.get('/doctors'),
          api.get('/departments')
        ]);
        setDoctors(docsData || []);
        setDepartments(deptsData || []);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Extract unique languages across all doctors
  const availableLanguages = Array.from(
    new Set(
      doctors.flatMap(doc => doc.languages || ['English'])
    )
  ).sort();

  // Extract unique specialties/departments across all doctors
  const availableSpecialties = Array.from(
    new Set([
      ...departments.map(d => d.name),
      ...doctors.map(d => d.specialization).filter(Boolean)
    ])
  ).sort();

  // Filter doctors based on criteria
  const filteredDoctors = doctors.filter(doc => {
    // 1. Keyword search (Name, Specialization, Department, Qualification)
    const name = doc.profiles?.name || '';
    const spec = doc.specialization || '';
    const dept = doc.departments?.name || '';
    const qual = doc.qualification || '';
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch = !term ||
      name.toLowerCase().includes(term) ||
      spec.toLowerCase().includes(term) ||
      dept.toLowerCase().includes(term) ||
      qual.toLowerCase().includes(term);

    // 2. Specialty / Department filter
    const matchesSpecialty = !selectedSpecialty ||
      dept.toLowerCase() === selectedSpecialty.toLowerCase() ||
      spec.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      (doc.department_id === selectedSpecialty);

    // 3. Language Spoken filter
    const docLangs = doc.languages || ['English'];
    const matchesLanguage = !selectedLanguage ||
      docLangs.some(lang => lang.toLowerCase() === selectedLanguage.toLowerCase());

    // 4. Availability Duration filter
    const docDurationMins = doc.slot_duration_mins || (doc.availability_duration ? parseInt(doc.availability_duration) : 15);
    let matchesDuration = true;
    if (selectedDuration === '15') {
      matchesDuration = docDurationMins <= 15;
    } else if (selectedDuration === '30') {
      matchesDuration = docDurationMins === 30 || docDurationMins === 20;
    } else if (selectedDuration === '45') {
      matchesDuration = docDurationMins === 45;
    } else if (selectedDuration === '60') {
      matchesDuration = docDurationMins >= 60;
    } else if (selectedDuration && !isNaN(parseInt(selectedDuration))) {
      matchesDuration = docDurationMins === parseInt(selectedDuration);
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
        title="Find a Doctor"
        subtitle="Search specialists by medical specialty, languages spoken, and consultation slot duration"
      />

      {/* Advanced Filter Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
            <SlidersHorizontal size={18} style={{ color: '#0f766e' }} /> Advanced Doctor Filter Engine
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
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Search Name / Keyword
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.88rem' }}
                placeholder="e.g. Dr. Chen, Interventional..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Specialty / Department Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Medical Specialty
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem' }}
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
            >
              <option value="">All Specialties & Departments</option>
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
              <option value="">All Spoken Languages</option>
              {availableLanguages.map((lang, idx) => (
                <option key={idx} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Availability Duration Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Consultation Duration
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem' }}
              value={selectedDuration}
              onChange={e => setSelectedDuration(e.target.value)}
            >
              <option value="">Any Duration</option>
              <option value="15">Quick Consult (≤ 15 mins)</option>
              <option value="30">Standard Consult (20 - 30 mins)</option>
              <option value="45">Extended Consult (45 mins)</option>
              <option value="60">Comprehensive Exam (60 mins)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Preset Chips */}
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
            ⏱️ 15-Min Quick Slots
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
            onClick={() => { setSelectedSpecialty('Dermatology'); }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              border: selectedSpecialty === 'Dermatology' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
              backgroundColor: selectedSpecialty === 'Dermatology' ? '#f0fdf4' : '#f8fafc',
              color: selectedSpecialty === 'Dermatology' ? '#0f766e' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🩺 Dermatology
          </button>
        </div>

        {/* Active Filter Tags Bar */}
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

      {/* Results Count Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
          Showing <strong>{filteredDoctors.length}</strong> of <strong>{doctors.length}</strong> doctors
        </div>
      </div>

      {/* Doctor Cards Directory */}
      {loading ? (
        <div>Searching doctors directory...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Stethoscope size={40} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>No doctors found matching your filter criteria</h3>
          <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
            Try broadening your specialty, language, or consultation duration selection.
          </p>
          <button className="btn-primary" onClick={resetFilters} style={{ margin: '0 auto' }}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
          {filteredDoctors.map(doc => {
            const docLangs = doc.languages || ['English'];
            const durationMins = doc.slot_duration_mins || (doc.availability_duration ? parseInt(doc.availability_duration) : 15);

            return (
              <div
                key={doc.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Doctor Header */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      backgroundColor: '#e0f2fe',
                      border: '2px solid #0284c7',
                      borderRadius: '50%',
                      color: '#0369a1',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {doc.profiles?.name ? doc.profiles.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DR'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.profiles?.name || 'Dr. Specialist'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className="badge badge-confirmed" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          {doc.departments?.name || 'Department'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700 }}>
                          • {doc.experience_years} yrs exp
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Attributes & Highlights */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    border: '1px solid #f1f5f9',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#1e293b' }}>
                      <Stethoscope size={15} style={{ color: '#0f766e', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#475569' }}>Specialty:</strong> {doc.specialization}
                      </div>
                    </div>

                    {/* Language Spoken Feature Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
                      <Globe size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#475569' }}>Languages:</strong>{' '}
                        {docLangs.map((lang, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: lang === selectedLanguage ? '#dbeafe' : '#ffffff',
                              border: `1px solid ${lang === selectedLanguage ? '#3b82f6' : '#cbd5e1'}`,
                              color: lang === selectedLanguage ? '#1d4ed8' : '#334155',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              marginRight: '0.25rem',
                              display: 'inline-block',
                              marginTop: '2px'
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Duration / Availability Slot Feature Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
                      <Clock size={15} style={{ color: '#0f766e', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: '#475569' }}>Consultation Slot:</strong>{' '}
                        <span style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.75rem'
                        }}>
                          {durationMins} mins
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ color: '#64748b' }}>Fee: <strong style={{ color: '#0f172a' }}>${doc.consultation_fee}</strong></span>
                      <span style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle size={12} /> {doc.next_available || 'Available Today'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: '#0f766e', borderRadius: '10px' }}
                  onClick={() => navigate(`/patient/book?doctor_id=${doc.id}`)}
                >
                  <Calendar size={16} /> Book {durationMins}-Min Slot
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
