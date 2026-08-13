import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { Plus, Building2 } from 'lucide-react';
import '../styles/tables.css';
import '../styles/forms.css';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchDepts = async () => {
    try {
      const data = await api.get('/departments');
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', { name, description });
      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchDepts();
    } catch (err) {
      alert(err.message || 'Failed to add department');
    }
  };

  return (
    <div>
      <Navbar
        title="Manage Departments"
        subtitle="Hospital clinical departments and units"
        actionButton={
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> + Add Department
          </button>
        }
      />

      {loading ? (
        <div>Loading departments...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {departments.map(dept => (
            <div key={dept.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--color-subtle-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                  <Building2 size={20} />
                </div>
                <h3 className="card-title" style={{ margin: 0 }}>{dept.name}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {dept.description || 'No detailed description provided.'}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Clinical Department">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Orthopedics, Oncology"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Primary healthcare services offered by this unit..."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Create Department
          </button>
        </form>
      </Modal>
    </div>
  );
}
