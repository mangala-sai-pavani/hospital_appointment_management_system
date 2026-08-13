-- Seed Data for Hospital Appointment Management System (CarePulse Health)

-- 1. DEPARTMENTS
INSERT INTO public.departments (id, name, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Cardiology', 'Heart and cardiovascular system care, diagnostics, and surgery.'),
('d2222222-2222-2222-2222-222222222222', 'Dermatology', 'Comprehensive skin, hair, and nail treatments and cosmetic care.'),
('d3333333-3333-3333-3333-333333333333', 'Neurology', 'Brain, spinal cord, and nervous system consultation and treatment.'),
('d4444444-4444-4444-4444-444444444444', 'Pediatrics', 'Specialized medical care and wellness for infants, children, and teens.'),
('d5555555-5555-5555-5555-555555555555', 'General Medicine', 'Primary healthcare, general physical exams, and chronic illness management.')
ON CONFLICT (name) DO NOTHING;

-- 2. PROFILES (ADMIN, RECEPTIONIST, DOCTORS, PATIENTS)
INSERT INTO public.profiles (id, name, email, phone, role) VALUES
('p1000000-0000-0000-0000-000000000001', 'Admin Sarah Connor', 'admin@hospital.com', '+1-555-0101', 'ADMIN'),
('p1000000-0000-0000-0000-000000000002', 'Receptionist Mark Davis', 'receptionist@hospital.com', '+1-555-0102', 'RECEPTIONIST'),

-- Doctors
('p1000000-0000-0000-0000-000000000003', 'Dr. Robert Chen', 'dr.chen@hospital.com', '+1-555-0201', 'DOCTOR'),
('p1000000-0000-0000-0000-000000000004', 'Dr. Elena Rostova', 'dr.rostova@hospital.com', '+1-555-0202', 'DOCTOR'),
('p1000000-0000-0000-0000-000000000005', 'Dr. Marcus Vance', 'dr.vance@hospital.com', '+1-555-0203', 'DOCTOR'),
('p1000000-0000-0000-0000-000000000006', 'Dr. Maya Patel', 'dr.patel@hospital.com', '+1-555-0204', 'DOCTOR'),

-- Patients
('p1000000-0000-0000-0000-000000000007', 'John Smith', 'john.smith@gmail.com', '+1-555-0301', 'PATIENT'),
('p1000000-0000-0000-0000-000000000008', 'Emily Watson', 'emily.watson@gmail.com', '+1-555-0302', 'PATIENT'),
('p1000000-0000-0000-0000-000000000009', 'Michael Jordan', 'michael.jordan@gmail.com', '+1-555-0303', 'PATIENT')
ON CONFLICT (email) DO NOTHING;

-- 3. DOCTORS
INSERT INTO public.doctors (id, profile_id, department_id, specialization, qualification, experience_years, consultation_fee, availability_status) VALUES
('doc11111-1111-1111-1111-111111111111', 'p1000000-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'Interventional Cardiology', 'MD, FACC', 14, 150.00, 'AVAILABLE'),
('doc22222-2222-2222-2222-222222222222', 'p1000000-0000-0000-0000-000000000004', 'd2222222-2222-2222-2222-222222222222', 'Clinical Dermatology & Cosmetology', 'MD, FAAD', 9, 120.00, 'AVAILABLE'),
('doc33333-3333-3333-3333-333333333333', 'p1000000-0000-0000-0000-000000000005', 'd3333333-3333-3333-3333-333333333333', 'Neurophysiology & Epilepsy', 'MD, DM Neurology', 12, 180.00, 'AVAILABLE'),
('doc44444-4444-4444-4444-444444444444', 'p1000000-0000-0000-0000-000000000006', 'd4444444-4444-4444-4444-444444444444', 'Pediatric Care & Immunology', 'MD Pediatrics', 8, 100.00, 'AVAILABLE')
ON CONFLICT (profile_id) DO NOTHING;

-- 4. PATIENTS
INSERT INTO public.patients (id, profile_id, date_of_birth, gender, phone, address, emergency_contact, blood_group) VALUES
('pat11111-1111-1111-1111-111111111111', 'p1000000-0000-0000-0000-000000000007', '1988-05-14', 'MALE', '+1-555-0301', '123 Pine St, Cityville', '+1-555-9901 (Wife)', 'O+'),
('pat22222-2222-2222-2222-222222222222', 'p1000000-0000-0000-0000-000000000008', '1992-11-20', 'FEMALE', '+1-555-0302', '456 Oak Ave, Townsville', '+1-555-9902 (Mother)', 'A+'),
('pat33333-3333-3333-3333-333333333333', 'p1000000-0000-0000-0000-000000000009', '1975-03-30', 'MALE', '+1-555-0303', '789 Maple Rd, Metropolis', '+1-555-9903 (Brother)', 'B-')
ON CONFLICT (profile_id) DO NOTHING;

-- 5. DOCTOR SCHEDULES
INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration, is_available) VALUES
('doc11111-1111-1111-1111-111111111111', 'MONDAY', '09:00:00', '13:00:00', 30, true),
('doc11111-1111-1111-1111-111111111111', 'WEDNESDAY', '09:00:00', '13:00:00', 30, true),
('doc11111-1111-1111-1111-111111111111', 'FRIDAY', '09:00:00', '13:00:00', 30, true),
('doc22222-2222-2222-2222-222222222222', 'TUESDAY', '10:00:00', '16:00:00', 30, true),
('doc22222-2222-2222-2222-222222222222', 'THURSDAY', '10:00:00', '16:00:00', 30, true),
('doc33333-3333-3333-3333-333333333333', 'MONDAY', '14:00:00', '18:00:00', 30, true),
('doc33333-3333-3333-3333-333333333333', 'THURSDAY', '14:00:00', '18:00:00', 30, true),
('doc44444-4444-4444-4444-444444444444', 'WEDNESDAY', '09:00:00', '15:00:00', 30, true),
('doc44444-4444-4444-4444-444444444444', 'FRIDAY', '09:00:00', '15:00:00', 30, true)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;

-- 6. APPOINTMENTS
INSERT INTO public.appointments (id, patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, symptoms, priority, status) VALUES
('apt11111-1111-1111-1111-111111111111', 'pat11111-1111-1111-1111-111111111111', 'doc11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:30:00', 'Routine Cardiac Checkup', 'Mild chest discomfort during exertion', 'NORMAL', 'CONFIRMED'),
('apt22222-2222-2222-2222-222222222222', 'pat22222-2222-2222-2222-222222222222', 'doc22222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', CURRENT_DATE, '10:30:00', 'Skin Allergy Consultation', 'Red rashes on arms', 'URGENT', 'PENDING'),
('apt33333-3333-3333-3333-333333333333', 'pat33333-3333-3333-3333-333333333333', 'doc33333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', CURRENT_DATE, '14:30:00', 'Frequent Migraines', 'Throbbing headache and light sensitivity', 'NORMAL', 'CONFIRMED')
ON CONFLICT DO NOTHING;

-- 7. QUEUES
INSERT INTO public.queues (id, appointment_id, doctor_id, patient_id, queue_number, priority, status, joined_at, checked_in_at) VALUES
('que11111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', 'doc11111-1111-1111-1111-111111111111', 'pat11111-1111-1111-1111-111111111111', 1, 'NORMAL', 'WAITING', NOW(), NOW())
ON CONFLICT (appointment_id) DO NOTHING;

-- 8. PATIENT QR TOKENS
INSERT INTO public.patient_qr_tokens (id, patient_id, token, is_active, created_at) VALUES
('qrt11111-1111-1111-1111-111111111111', 'pat11111-1111-1111-1111-111111111111', 'CP-PAT-1001-TOKEN', true, NOW()),
('qrt22222-2222-2222-2222-222222222222', 'pat22222-2222-2222-2222-222222222222', 'CP-PAT-1002-TOKEN', true, NOW()),
('qrt33333-3333-3333-3333-333333333333', 'pat33333-3333-3333-3333-333333333333', 'CP-PAT-1003-TOKEN', true, NOW())
ON CONFLICT (token) DO NOTHING;

-- 9. PRESCRIPTIONS & PRESCRIPTION ITEMS
INSERT INTO public.prescriptions (id, appointment_id, patient_id, doctor_id, diagnosis, instructions) VALUES
('rx111111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', 'pat11111-1111-1111-1111-111111111111', 'doc11111-1111-1111-1111-111111111111', 'Essential Hypertension & Cardiac Strain', 'Maintain low-sodium diet and log morning BP daily.')
ON CONFLICT (appointment_id) DO NOTHING;

INSERT INTO public.prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions) VALUES
('rxi11111-1111-1111-1111-111111111111', 'rx111111-1111-1111-1111-111111111111', 'Lisinopril', '10mg', 'Once daily', '30 days', 'Take in the morning with food'),
('rxi22222-2222-2222-2222-222222222222', 'rx111111-1111-1111-1111-111111111111', 'Aspirin Low Dose', '81mg', 'Once daily', '30 days', 'Take after dinner')
ON CONFLICT DO NOTHING;

-- 10. REFUNDS
INSERT INTO public.refunds (id, appointment_id, patient_id, original_amount, cancellation_fee, refund_amount, refund_percentage, cancellation_reason, cancelled_by, refund_status) VALUES
('ref11111-1111-1111-1111-111111111111', 'apt22222-2222-2222-2222-222222222222', 'pat22222-2222-2222-2222-222222222222', 120.00, 12.00, 108.00, 90, 'Schedule conflict reported >24 hours prior', 'p1000000-0000-0000-0000-000000000008', 'COMPLETED')
ON CONFLICT (appointment_id) DO NOTHING;

-- 11. NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, type) VALUES
('p1000000-0000-0000-0000-000000000007', 'Appointment Confirmed', 'Your appointment with Dr. Robert Chen is confirmed for today at 09:30 AM.', 'SUCCESS'),
('p1000000-0000-0000-0000-000000000008', 'Appointment Pending', 'Your appointment request with Dr. Elena Rostova is pending approval.', 'INFO')
ON CONFLICT DO NOTHING;

-- 13. AMBULANCES
INSERT INTO public.ambulances (id, vehicle_number, ambulance_type, status, base_fee, per_km_fee, assistance_fee, driver_name, contact_number) VALUES
('amb11111-1111-1111-1111-111111111111', 'AMB-CP-01', 'BASIC', 'AVAILABLE', 50.00, 5.00, 25.00, 'John Driver', '+1 (555) 019-2831'),
('amb22222-2222-2222-2222-222222222222', 'AMB-CP-02', 'ASSISTED', 'AVAILABLE', 75.00, 6.50, 40.00, 'Sarah Paramedic', '+1 (555) 019-4820'),
('amb33333-3333-3333-3333-333333333333', 'AMB-CP-03', 'ADVANCED', 'MAINTENANCE', 100.00, 8.00, 60.00, 'Michael Responder', '+1 (555) 019-9921')
ON CONFLICT (vehicle_number) DO NOTHING;

-- 14. AMBULANCE REQUESTS
INSERT INTO public.ambulance_requests (id, appointment_id, patient_id, ambulance_id, pickup_address, destination, assistance_required, reason, contact_number, estimated_distance, estimated_fee, final_fee, status, notes) VALUES
('amr11111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', 'pat11111-1111-1111-1111-111111111111', 'amb11111-1111-1111-1111-111111111111', '742 Evergreen Terrace, Springfield', 'CarePulse Central Hospital - Cardiac Wing', 'ASSISTED', 'Patient experiences mild mobility limitation following cardiac treatment.', '+1 (555) 019-2831', 8.5, 117.50, 117.50, 'AMBULANCE_ASSIGNED', 'Wheelchair lift required upon pickup')
ON CONFLICT DO NOTHING;

-- 15. AUDIT LOGS
INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata) VALUES
('p1000000-0000-0000-0000-000000000001', 'INITIALIZE_SCHEMA_AND_SEED', 'SYSTEM', '00000000-0000-0000-0000-000000000000', '{"phase": 1, "description": "Database schema and seed initialized successfully"}'::jsonb);


