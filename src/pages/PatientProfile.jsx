import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  FileText,
  Activity,
  AlertTriangle,
  Scissors,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  ShieldAlert,
  Clock,
  Stethoscope,
  Heart
} from 'lucide-react';
import '../styles/forms.css';
import '../styles/tables.css';

export default function PatientProfile() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'

  const [patientData, setPatientData] = useState({
    id: '',
    date_of_birth: '',
    gender: 'MALE',
    phone: '',
    address: '',
    emergency_contact: '',
    blood_group: 'O+',
    medical_history: {
      diagnoses: [],
      allergies: [],
      surgeries: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals for adding medical history items
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddSurgeryOpen, setIsAddSurgeryOpen] = useState(false);

  // New item form states
  const [diagnosisForm, setDiagnosisForm] = useState({
    condition: '',
    diagnosed_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    severity: 'MODERATE',
    doctor_notes: ''
  });

  const [allergyForm, setAllergyForm] = useState({
    allergen: '',
    reaction: '',
    severity: 'MODERATE',
    identified_date: new Date().toISOString().split('T')[0]
  });

  const [surgeryForm, setSurgeryForm] = useState({
    surgery_name: '',
    surgery_date: new Date().toISOString().split('T')[0],
    hospital: '',
    surgeon: '',
    notes: ''
  });

  useEffect(() => {
    async function loadPatient() {
      try {
        const patients = await api.get('/patients');
        const myPat = (patients || []).find(p => p.profile_id === profile?.id || p.id === profile?.id);
        if (myPat) {
          setPatientData({
            id: myPat.id,
            date_of_birth: myPat.date_of_birth || '',
            gender: myPat.gender || 'MALE',
            phone: myPat.phone || profile?.phone || '',
            address: myPat.address || '',
            emergency_contact: myPat.emergency_contact || '',
            blood_group: myPat.blood_group || 'O+',
            medical_history: myPat.medical_history || {
              diagnoses: [
                {
                  id: 'diag-101',
                  condition: 'Essential Hypertension (Stage 1)',
                  diagnosed_date: '2021-04-12',
                  status: 'CHRONIC',
                  severity: 'MODERATE',
                  doctor_notes: 'Maintained on Lisinopril 10mg daily. Patient advises compliance with low-sodium diet.'
                },
                {
                  id: 'diag-102',
                  condition: 'Acute Bacterial Bronchitis',
                  diagnosed_date: '2023-01-18',
                  status: 'RESOLVED',
                  severity: 'MILD',
                  doctor_notes: 'Completed 7-day Amoxicillin therapy. Lungs clear on follow-up.'
                }
              ],
              allergies: [
                {
                  id: 'alg-201',
                  allergen: 'Penicillin & Beta-Lactams',
                  reaction: 'Anaphylaxis, Urticaria & Breathing Difficulty',
                  severity: 'CRITICAL',
                  identified_date: '2015-08-22'
                },
                {
                  id: 'alg-202',
                  allergen: 'Latex Gloves / Rubber Adhesives',
                  reaction: 'Contact Dermatitis & Skin Rash',
                  severity: 'MILD',
                  identified_date: '2019-11-05'
                }
              ],
              surgeries: [
                {
                  id: 'surg-301',
                  surgery_name: 'Laparoscopic Appendectomy',
                  surgery_date: '2018-09-14',
                  hospital: 'CarePulse Central Hospital',
                  surgeon: 'Dr. Arthur Pendelton',
                  notes: 'Emergency procedure following acute appendicitis. Healing uneventful with minimal scarring.'
                }
              ]
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      if (patientData.id) {
        await api.put(`/patients/${patientData.id}`, patientData);
        setSuccessMsg('Personal profile details updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const saveUpdatedHistory = async (newHistory) => {
    const updated = { ...patientData, medical_history: newHistory };
    setPatientData(updated);
    if (patientData.id) {
      try {
        await api.put(`/patients/${patientData.id}`, updated);
      } catch (err) {
        console.error('Failed to sync medical history to backend:', err);
      }
    }
  };

  // Add Handlers
  const handleAddDiagnosis = async (e) => {
    e.preventDefault();
    const newEntry = { id: `diag-${Date.now()}`, ...diagnosisForm };
    const currentList = patientData.medical_history?.diagnoses || [];
    const newHistory = {
      ...patientData.medical_history,
      diagnoses: [newEntry, ...currentList]
    };
    await saveUpdatedHistory(newHistory);
    setIsAddDiagnosisOpen(false);
    setDiagnosisForm({
      condition: '',
      diagnosed_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      severity: 'MODERATE',
      doctor_notes: ''
    });
    setSuccessMsg('Past diagnosis added to medical record!');
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    const newEntry = { id: `alg-${Date.now()}`, ...allergyForm };
    const currentList = patientData.medical_history?.allergies || [];
    const newHistory = {
      ...patientData.medical_history,
      allergies: [newEntry, ...currentList]
    };
    await saveUpdatedHistory(newHistory);
    setIsAddAllergyOpen(false);
    setAllergyForm({
      allergen: '',
      reaction: '',
      severity: 'MODERATE',
      identified_date: new Date().toISOString().split('T')[0]
    });
    setSuccessMsg('Allergy alert added to medical record!');
  };

  const handleAddSurgery = async (e) => {
    e.preventDefault();
    const newEntry = { id: `surg-${Date.now()}`, ...surgeryForm };
    const currentList = patientData.medical_history?.surgeries || [];
    const newHistory = {
      ...patientData.medical_history,
      surgeries: [newEntry, ...currentList]
    };
    await saveUpdatedHistory(newHistory);
    setIsAddSurgeryOpen(false);
    setSurgeryForm({
      surgery_name: '',
      surgery_date: new Date().toISOString().split('T')[0],
      hospital: '',
      surgeon: '',
      notes: ''
    });
    setSuccessMsg('Surgical procedure logged to medical history!');
  };

  // Delete Handlers
  const handleDeleteDiagnosis = async (id) => {
    if (!confirm('Are you sure you want to remove this diagnosis entry?')) return;
    const currentList = patientData.medical_history?.diagnoses || [];
    const newHistory = {
      ...patientData.medical_history,
      diagnoses: currentList.filter(item => item.id !== id)
    };
    await saveUpdatedHistory(newHistory);
  };

  const handleDeleteAllergy = async (id) => {
    if (!confirm('Are you sure you want to remove this allergy record?')) return;
    const currentList = patientData.medical_history?.allergies || [];
    const newHistory = {
      ...patientData.medical_history,
      allergies: currentList.filter(item => item.id !== id)
    };
    await saveUpdatedHistory(newHistory);
  };

  const handleDeleteSurgery = async (id) => {
    if (!confirm('Are you sure you want to remove this surgery entry?')) return;
    const currentList = patientData.medical_history?.surgeries || [];
    const newHistory = {
      ...patientData.medical_history,
      surgeries: currentList.filter(item => item.id !== id)
    };
    await saveUpdatedHistory(newHistory);
  };

  const diagnosesList = patientData.medical_history?.diagnoses || [];
  const allergiesList = patientData.medical_history?.allergies || [];
  const surgeriesList = patientData.medical_history?.surgeries || [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Navbar
        title="Patient Medical Profile"
        subtitle="Manage personal demographics, medical history, allergies, and surgical records"
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
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--color-sidebar)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '4.25rem',
              height: '4.25rem',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '50%',
              color: 'var(--color-primary-dark)',
              fontSize: '1.85rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyIn: 'center',
              justifyContent: 'center'
            }}>
              {profile?.name ? profile.name.charAt(0) : 'P'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{profile?.name || 'Patient Profile'}</h2>
              <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '2px' }}>{profile?.email}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge badge-confirmed">PATIENT RECORD</span>
                <span className="badge badge-info">Blood Type: {patientData.blood_group}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.75, textTransform: 'uppercase' }}>Recorded Conditions</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{diagnosesList.length}</div>
            </div>
            <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.75, textTransform: 'uppercase' }}>Known Allergies</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: allergiesList.length > 0 ? '#fca5a5' : '#ffffff' }}>
                {allergiesList.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid var(--color-border)',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'profile' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'profile' ? '#ffffff' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
        >
          <User size={18} /> Personal Info
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'history' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Activity size={18} /> Medical History
        </button>
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Personal & Contact Demographics</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={patientData.phone}
                onChange={e => setPatientData({ ...patientData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={patientData.date_of_birth}
                onChange={e => setPatientData({ ...patientData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={patientData.gender}
                onChange={e => setPatientData({ ...patientData, gender: e.target.value })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={patientData.blood_group}
                onChange={e => setPatientData({ ...patientData, blood_group: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Home Address</label>
            <input
              type="text"
              className="form-input"
              value={patientData.address}
              onChange={e => setPatientData({ ...patientData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact Info</label>
            <input
              type="text"
              className="form-input"
              value={patientData.emergency_contact}
              onChange={e => setPatientData({ ...patientData, emergency_contact: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      )}

      {/* TAB 2: MEDICAL HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SECTION 1: PAST DIAGNOSES */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={20} color="var(--color-primary)" /> Past Diagnoses & Chronic Conditions
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Recorded medical conditions, chronic illnesses, and resolved health issues
                </p>
              </div>
              <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => setIsAddDiagnosisOpen(true)}>
                <Plus size={14} /> Add Diagnosis
              </button>
            </div>

            {diagnosesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                No past diagnoses recorded yet. Click "Add Diagnosis" to log a medical condition.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {diagnosesList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      backgroundColor: '#fafcfc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {item.condition}
                        </span>
                        <span className={`badge ${item.status === 'CHRONIC' ? 'badge-cancelled' : item.status === 'ACTIVE' ? 'badge-pending' : 'badge-confirmed'}`}>
                          {item.status}
                        </span>
                        <span className="badge badge-info">
                          Severity: {item.severity}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={12} /> Diagnosed Date: {item.diagnosed_date}
                      </div>

                      {item.doctor_notes && (
                        <div style={{ fontSize: '0.85rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong>Notes:</strong> {item.doctor_notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteDiagnosis(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px' }}
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: ALLERGIES & SENSITIVITIES */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={20} color="#dc2626" /> Allergies & Drug Sensitivities
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Critical allergy alerts for medication, food, and environmental triggers
                </p>
              </div>
              <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', backgroundColor: '#dc2626' }} onClick={() => setIsAddAllergyOpen(true)}>
                <Plus size={14} /> Add Allergy
              </button>
            </div>

            {allergiesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                No known allergies flagged. Click "Add Allergy" to log a drug or food allergy.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {allergiesList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: item.severity === 'CRITICAL' || item.severity === 'SEVERE' ? '1px solid #fca5a5' : '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      backgroundColor: item.severity === 'CRITICAL' || item.severity === 'SEVERE' ? '#fef2f2' : '#fafcfc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: item.severity === 'CRITICAL' ? '#991b1b' : 'var(--color-text-main)' }}>
                          {item.allergen}
                        </span>
                        <span className={`badge ${item.severity === 'CRITICAL' ? 'badge-cancelled' : 'badge-pending'}`}>
                          {item.severity}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                        <strong>Reaction:</strong> {item.reaction}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Identified: {item.identified_date}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAllergy(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: SURGERIES & PAST PROCEDURES */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scissors size={20} color="var(--color-primary)" /> Surgeries & Past Procedures
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Surgical history, inpatient operations, and invasive procedure logs
                </p>
              </div>
              <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => setIsAddSurgeryOpen(true)}>
                <Plus size={14} /> Add Surgery
              </button>
            </div>

            {surgeriesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                No past surgeries or major surgical procedures logged.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {surgeriesList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      backgroundColor: '#fafcfc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                        {item.surgery_name}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span><strong>Date:</strong> {item.surgery_date}</span>
                        {item.hospital && <span><strong>Hospital:</strong> {item.hospital}</span>}
                        {item.surgeon && <span><strong>Surgeon:</strong> {item.surgeon}</span>}
                      </div>

                      {item.notes && (
                        <div style={{ fontSize: '0.85rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong>Procedure Notes:</strong> {item.notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSurgery(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD DIAGNOSIS */}
      <Modal isOpen={isAddDiagnosisOpen} onClose={() => setIsAddDiagnosisOpen(false)} title="Log Past Diagnosis / Condition">
        <form onSubmit={handleAddDiagnosis}>
          <div className="form-group">
            <label className="form-label">Diagnosis / Medical Condition Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Type 2 Diabetes, Asthma, Essential Hypertension"
              value={diagnosisForm.condition}
              onChange={e => setDiagnosisForm({ ...diagnosisForm, condition: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Diagnosed Date</label>
              <input
                type="date"
                className="form-input"
                value={diagnosisForm.diagnosed_date}
                onChange={e => setDiagnosisForm({ ...diagnosisForm, diagnosed_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Condition Status</label>
              <select
                className="form-select"
                value={diagnosisForm.status}
                onChange={e => setDiagnosisForm({ ...diagnosisForm, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CHRONIC">CHRONIC</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <select
              className="form-select"
              value={diagnosisForm.severity}
              onChange={e => setDiagnosisForm({ ...diagnosisForm, severity: e.target.value })}
            >
              <option value="MILD">MILD</option>
              <option value="MODERATE">MODERATE</option>
              <option value="SEVERE">SEVERE</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Physician Notes / Treatment Overview</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Medications prescribed, lifestyle plans, or follow-up details..."
              value={diagnosisForm.doctor_notes}
              onChange={e => setDiagnosisForm({ ...diagnosisForm, doctor_notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Save Diagnosis Record
          </button>
        </form>
      </Modal>

      {/* MODAL: ADD ALLERGY */}
      <Modal isOpen={isAddAllergyOpen} onClose={() => setIsAddAllergyOpen(false)} title="Add Allergy or Sensitivity Alert">
        <form onSubmit={handleAddAllergy}>
          <div className="form-group">
            <label className="form-label">Allergen / Trigger Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Penicillin, Latex, Peanuts, Sulfa Drugs"
              value={allergyForm.allergen}
              onChange={e => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allergic Reaction Symptoms *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Anaphylaxis, Skin Hives, Swelling, Nausea"
              value={allergyForm.reaction}
              onChange={e => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                className="form-select"
                value={allergyForm.severity}
                onChange={e => setAllergyForm({ ...allergyForm, severity: e.target.value })}
              >
                <option value="CRITICAL">CRITICAL (Life-Threatening)</option>
                <option value="SEVERE">SEVERE</option>
                <option value="MODERATE">MODERATE</option>
                <option value="MILD">MILD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Identified Date</label>
              <input
                type="date"
                className="form-input"
                value={allergyForm.identified_date}
                onChange={e => setAllergyForm({ ...allergyForm, identified_date: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', backgroundColor: '#dc2626' }}>
            Save Allergy Alert
          </button>
        </form>
      </Modal>

      {/* MODAL: ADD SURGERY */}
      <Modal isOpen={isAddSurgeryOpen} onClose={() => setIsAddSurgeryOpen(false)} title="Log Surgical Procedure">
        <form onSubmit={handleAddSurgery}>
          <div className="form-group">
            <label className="form-label">Surgery / Procedure Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Laparoscopic Appendectomy, Knee Arthroscopy"
              value={surgeryForm.surgery_name}
              onChange={e => setSurgeryForm({ ...surgeryForm, surgery_name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Procedure</label>
              <input
                type="date"
                className="form-input"
                value={surgeryForm.surgery_date}
                onChange={e => setSurgeryForm({ ...surgeryForm, surgery_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital / Surgical Facility</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CarePulse Central Hospital"
                value={surgeryForm.hospital}
                onChange={e => setSurgeryForm({ ...surgeryForm, hospital: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lead Surgeon / Specialist</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Arthur Pendelton"
              value={surgeryForm.surgeon}
              onChange={e => setSurgeryForm({ ...surgeryForm, surgeon: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Surgical Outcome & Post-op Notes</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Outcome, recovery period, or implants/hardware..."
              value={surgeryForm.notes}
              onChange={e => setSurgeryForm({ ...surgeryForm, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Save Surgery Log
          </button>
        </form>
      </Modal>
    </div>
  );
}
