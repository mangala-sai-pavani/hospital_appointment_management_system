
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { Plus } from 'lucide-react';
import '../styles/tables.css';
import '../styles/forms.css';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    password: 'DoctorPass123!',
    department_id: '',
    specialization: '',
    qualification: 'MD',
    experience_years: 5,
    consultation_fee: 120
  };

  const [formData, setFormData] = useState(initialFormData);

  // --------------------------------------------------
  // FETCH DOCTORS + DEPARTMENTS
  // --------------------------------------------------

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const [doctorsData, departmentsData] = await Promise.all([
        api.get('/doctors'),
        api.get('/departments')
      ]);

      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

      if (departmentsData?.length > 0 && !formData.department_id) {
        setFormData(prev => ({
          ...prev,
          department_id: departmentsData[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    // Name:
    // Letters, spaces, apostrophe and hyphen allowed.
    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

    // Indian 10-digit mobile number.
    const phoneRegex = /^[6-9][0-9]{9}$/;

    // Standard email validation.
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // Specialization:
    // Letters, numbers, spaces, &, ., -, / allowed.
    const specializationRegex =
      /^[A-Za-z0-9]+(?:[ &./'-][A-Za-z0-9]+)*$/;

    // Qualification:
    // Supports values such as:
    // MBBS
    // MBBS, MD
    // MBBS, MD, DM Neurology
    const qualificationRegex =
      /^[A-Za-z0-9]+(?:[ ,.&/'-][A-Za-z0-9]+)*$/;

    // ---------------- NAME ----------------

    const name = formData.name.trim();

    if (!name) {
      newErrors.name = 'Doctor name is required.';
    } else if (name.length < 2) {
      newErrors.name = 'Doctor name must contain at least 2 characters.';
    } else if (name.length > 100) {
      newErrors.name = 'Doctor name cannot exceed 100 characters.';
    } else if (!nameRegex.test(name)) {
      newErrors.name =
        'Name can contain letters, spaces, apostrophes and hyphens only.';
    }

    // ---------------- EMAIL ----------------

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (email.length > 150) {
      newErrors.email = 'Email cannot exceed 150 characters.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // ---------------- PHONE ----------------

    const phone = formData.phone.trim();

    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone =
        'Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9.';
    }

    // ---------------- DEPARTMENT ----------------

    if (!formData.department_id) {
      newErrors.department_id = 'Please select a department.';
    }

    // ---------------- SPECIALIZATION ----------------

    const specialization = formData.specialization.trim();

    if (!specialization) {
      newErrors.specialization = 'Specialization is required.';
    } else if (specialization.length > 100) {
      newErrors.specialization =
        'Specialization cannot exceed 100 characters.';
    } else if (!specializationRegex.test(specialization)) {
      newErrors.specialization =
        'Specialization contains invalid characters.';
    }

    // ---------------- QUALIFICATION ----------------

    const qualification = formData.qualification.trim();

    if (!qualification) {
      newErrors.qualification = 'Qualification is required.';
    } else if (qualification.length > 150) {
      newErrors.qualification =
        'Qualification cannot exceed 150 characters.';
    } else if (!qualificationRegex.test(qualification)) {
      newErrors.qualification =
        'Qualification contains invalid characters.';
    }

    // ---------------- EXPERIENCE ----------------

    const experience = Number(formData.experience_years);

    if (
      formData.experience_years === '' ||
      !Number.isInteger(experience)
    ) {
      newErrors.experience_years =
        'Experience must be a whole number.';
    } else if (experience < 0) {
      newErrors.experience_years =
        'Experience cannot be negative.';
    } else if (experience > 70) {
      newErrors.experience_years =
        'Experience cannot exceed 70 years.';
    }

    // ---------------- CONSULTATION FEE ----------------

    const fee = Number(formData.consultation_fee);

    if (
      formData.consultation_fee === '' ||
      !Number.isFinite(fee)
    ) {
      newErrors.consultation_fee =
        'Consultation fee is required.';
    } else if (fee <= 0) {
      newErrors.consultation_fee =
        'Consultation fee must be greater than ₹0.';
    } else if (fee > 100000) {
      newErrors.consultation_fee =
        'Consultation fee cannot exceed ₹100,000.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // --------------------------------------------------
  // CREATE DOCTOR
  // --------------------------------------------------

  const handleCreate = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        department_id: formData.department_id,
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        experience_years: Number(formData.experience_years),
        consultation_fee: Number(formData.consultation_fee)
      };

      await api.post('/doctors', payload);

      alert('Doctor profile created successfully.');

      setIsModalOpen(false);
      setErrors({});

      setFormData({
        ...initialFormData,
        department_id: departments[0]?.id || ''
      });

      await fetchDoctors();
    } catch (err) {
      console.error('Create doctor error:', err);

      alert(
        err?.message ||
          'Failed to create doctor profile.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // OPEN MODAL
  // --------------------------------------------------

  const openModal = () => {
    setErrors({});

    setFormData({
      ...initialFormData,
      department_id: departments[0]?.id || ''
    });

    setIsModalOpen(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setErrors({});
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div>
      <Navbar
        title="Manage Doctors"
        subtitle="Add specialists and manage medical qualifications"
        actionButton={
          <button
            type="button"
            className="btn-primary"
            onClick={openModal}
          >
            <Plus size={18} />
            Add New Doctor
          </button>
        }
      />

      {/* DOCTOR TABLE */}

      {loading ? (
        <div style={{ padding: '2rem' }}>
          Loading doctors...
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Consultation Fee</th>
              </tr>
            </thead>

            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: 'center',
                      padding: '2rem'
                    }}
                  >
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map(doctor => (
                  <tr key={doctor.id}>
                    {/* DOCTOR */}

                    <td>
                      <div className="table-patient-info">
                        <span className="patient-name">
                          {doctor.profiles?.name ||
                            doctor.doctor_name ||
                            'Dr. Specialist'}
                        </span>

                        <span className="patient-sub">
                          {doctor.profiles?.email ||
                            doctor.email ||
                            '—'}
                        </span>
                      </div>
                    </td>

                    {/* DEPARTMENT */}

                    <td>
                      {doctor.departments?.name ||
                        doctor.department ||
                        'General'}
                    </td>

                    {/* SPECIALIZATION */}

                    <td>
                      {doctor.specialization || '—'}
                    </td>

                    {/* QUALIFICATION */}

                    <td>
                      {doctor.qualification || '—'}
                    </td>

                    {/* EXPERIENCE */}

                    <td>
                      {doctor.experience_years ?? 0} yrs
                    </td>

                    {/* FEE */}

                    <td>
                      <strong>
                        ₹
                        {Number(
                          doctor.consultation_fee || 0
                        ).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD DOCTOR MODAL */}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add New Doctor Account"
      >
        <form
          onSubmit={handleCreate}
          noValidate
        >
          {/* NAME */}

          <div className="form-group">
            <label className="form-label">
              Full Name *
            </label>

            <input
              type="text"
              className="form-input"
              value={formData.name}
              maxLength={100}
              autoComplete="name"
              placeholder="Dr. Ananya Iyer"
              onChange={event =>
                handleChange(
                  'name',
                  event.target.value
                )
              }
              required
            />

            {errors.name && (
              <small className="form-error">
                {errors.name}
              </small>
            )}
          </div>

          {/* EMAIL + PHONE */}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Email Address *
              </label>

              <input
                type="email"
                className="form-input"
                value={formData.email}
                maxLength={150}
                autoComplete="email"
                placeholder="doctor@example.com"
                onChange={event =>
                  handleChange(
                    'email',
                    event.target.value
                  )
                }
                required
              />

              {errors.email && (
                <small className="form-error">
                  {errors.email}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>

              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                onChange={event => {
                  const digitsOnly =
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10);

                  handleChange(
                    'phone',
                    digitsOnly
                  );
                }}
              />

              {errors.phone && (
                <small className="form-error">
                  {errors.phone}
                </small>
              )}
            </div>
          </div>

          {/* DEPARTMENT */}

          <div className="form-group">
            <label className="form-label">
              Department *
            </label>

            <select
              className="form-select"
              value={formData.department_id}
              onChange={event =>
                handleChange(
                  'department_id',
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select Department
              </option>

              {departments.map(department => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>

            {errors.department_id && (
              <small className="form-error">
                {errors.department_id}
              </small>
            )}
          </div>

          {/* SPECIALIZATION + QUALIFICATION */}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Specialization *
              </label>

              <input
                type="text"
                className="form-input"
                value={formData.specialization}
                maxLength={100}
                placeholder="e.g. Pediatric Surgery"
                onChange={event =>
                  handleChange(
                    'specialization',
                    event.target.value
                  )
                }
                required
              />

              {errors.specialization && (
                <small className="form-error">
                  {errors.specialization}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Qualification *
              </label>

              <input
                type="text"
                className="form-input"
                value={formData.qualification}
                maxLength={150}
                placeholder="MBBS, MD, DM"
                onChange={event =>
                  handleChange(
                    'qualification',
                    event.target.value
                  )
                }
                required
              />

              {errors.qualification && (
                <small className="form-error">
                  {errors.qualification}
                </small>
              )}
            </div>
          </div>

          {/* EXPERIENCE + FEE */}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Years of Experience *
              </label>

              <input
                type="number"
                className="form-input"
                value={formData.experience_years}
                min="0"
                max="70"
                step="1"
                onChange={event =>
                  handleChange(
                    'experience_years',
                    event.target.value
                  )
                }
                required
              />

              {errors.experience_years && (
                <small className="form-error">
                  {errors.experience_years}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Consultation Fee (₹) *
              </label>

              <input
                type="number"
                className="form-input"
                value={formData.consultation_fee}
                min="1"
                max="100000"
                step="1"
                onChange={event =>
                  handleChange(
                    'consultation_fee',
                    event.target.value
                  )
                }
                required
              />

              {errors.consultation_fee && (
                <small className="form-error">
                  {errors.consultation_fee}
                </small>
              )}
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '1rem',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting
              ? 'Creating Doctor...'
              : 'Create Doctor Profile'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

