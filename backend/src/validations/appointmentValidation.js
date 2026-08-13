import { validateDate, validatePriority } from './inputValidations.js';

export function validateAppointment(data, isEmergency = false, isAdminOverride = false) {
  const errors = [];

  if (!data.doctor_id && !isEmergency) {
    errors.push('Doctor ID is required');
  }

  if (!data.department_id && isEmergency) {
    errors.push('Department ID is required for emergency booking');
  }

  if (!data.patient_id) {
    errors.push('Patient ID is required');
  }

  const dateErr = validateDate(data.appointment_date, isAdminOverride, 'Appointment Date');
  if (dateErr) errors.push(dateErr);

  if (!data.appointment_time) {
    errors.push('Appointment time slot is required');
  }

  if (data.priority) {
    const prioErr = validatePriority(data.priority);
    if (prioErr) errors.push(prioErr);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
