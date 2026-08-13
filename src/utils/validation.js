/**
 * Frontend Validation Engine for CarePulse Hospital
 * Mirroring backend rules for real-time field-level UI feedback.
 */

const NAME_REGEX = /^[a-zA-Z\s'-]{2,100}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/;
const GENERAL_PHONE_REGEX = /^\+?\d{10,15}$/;

export function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return `${fieldName} is required`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (trimmed.length > 100) {
    return `${fieldName} cannot exceed 100 characters`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldName} can contain only letters, spaces, hyphens, and apostrophes (e.g. John, O'Connor)`;
  }
  return '';
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return 'Email address is required';
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed) || trimmed.includes('@@')) {
    return 'Please enter a valid email address (e.g. user@hospital.com)';
  }
  return '';
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return 'Phone number is required';
  }
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  if (!PHONE_REGEX.test(cleanPhone) && !GENERAL_PHONE_REGEX.test(cleanPhone)) {
    return 'Phone number must contain 10 valid digits (e.g. 9876543210)';
  }
  return '';
}

export function validateAge(age) {
  if (age === undefined || age === null || age === '') {
    return 'Age is required';
  }
  const num = Number(age);
  if (isNaN(num) || !Number.isInteger(num)) {
    return 'Age must be a whole number';
  }
  if (num < 0 || num > 120) {
    return 'Age must be between 0 and 120 years';
  }
  return '';
}

export function validateExperience(years) {
  if (years === undefined || years === null || years === '') {
    return 'Years of experience is required';
  }
  const num = Number(years);
  if (isNaN(num)) {
    return 'Experience must be a valid number';
  }
  if (num < 0) {
    return 'Experience cannot be negative';
  }
  if (num > 70) {
    return 'Experience cannot exceed 70 years';
  }
  return '';
}

export function validateConsultationFee(fee) {
  if (fee === undefined || fee === null || fee === '') {
    return 'Consultation fee is required';
  }
  const num = Number(fee);
  if (isNaN(num)) {
    return 'Consultation fee must be a valid number';
  }
  if (num < 0) {
    return 'Consultation fee cannot be negative';
  }
  return '';
}

export function validateDate(dateStr, allowPast = false, fieldName = 'Appointment Date') {
  if (!dateStr || typeof dateStr !== 'string') {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid date for ${fieldName}`;
  }
  if (!allowPast) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) {
      return `${fieldName} cannot be in the past`;
    }
  }
  return '';
}
