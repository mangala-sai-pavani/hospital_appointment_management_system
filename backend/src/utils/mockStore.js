export const mockData = {
  departments: [
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Cardiology', description: 'Heart and cardiovascular system care, diagnostics, and surgery.', created_at: new Date().toISOString() },
    { id: 'd2222222-2222-2222-2222-222222222222', name: 'Dermatology', description: 'Comprehensive skin, hair, and nail treatments and cosmetic care.', created_at: new Date().toISOString() },
    { id: 'd3333333-3333-3333-3333-333333333333', name: 'Neurology', description: 'Brain, spinal cord, and nervous system consultation and treatment.', created_at: new Date().toISOString() },
    { id: 'd4444444-4444-4444-4444-444444444444', name: 'Pediatrics', description: 'Specialized medical care and wellness for infants, children, and teens.', created_at: new Date().toISOString() },
    { id: 'd5555555-5555-5555-5555-555555555555', name: 'General Medicine', description: 'Primary healthcare, general physical exams, and chronic illness management.', created_at: new Date().toISOString() }
  ],

  profiles: [
    { id: 'p1000000-0000-0000-0000-000000000001', auth_user_id: 'auth-admin-1', name: 'Admin Sarah Connor', email: 'admin@hospital.com', phone: '+1-555-0101', role: 'ADMIN', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000002', auth_user_id: 'auth-rec-1', name: 'Receptionist Mark Davis', email: 'receptionist@hospital.com', phone: '+1-555-0102', role: 'RECEPTIONIST', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000003', auth_user_id: 'auth-doc-1', name: 'Dr. Robert Chen', email: 'dr.chen@hospital.com', phone: '+1-555-0201', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000004', auth_user_id: 'auth-doc-2', name: 'Dr. Elena Rostova', email: 'dr.rostova@hospital.com', phone: '+1-555-0202', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000005', auth_user_id: 'auth-doc-3', name: 'Dr. Marcus Vance', email: 'dr.vance@hospital.com', phone: '+1-555-0203', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000006', auth_user_id: 'auth-doc-4', name: 'Dr. Maya Patel', email: 'dr.patel@hospital.com', phone: '+1-555-0204', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000010', auth_user_id: 'auth-doc-5', name: 'Dr. Alejandro Gomez', email: 'dr.gomez@hospital.com', phone: '+1-555-0205', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000011', auth_user_id: 'auth-doc-6', name: 'Dr. Aisha Al-Mansoor', email: 'dr.almansoor@hospital.com', phone: '+1-555-0206', role: 'DOCTOR', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000007', auth_user_id: 'auth-pat-1', name: 'John Smith', email: 'john.smith@gmail.com', phone: '+1-555-0301', role: 'PATIENT', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000008', auth_user_id: 'auth-pat-2', name: 'Emily Watson', email: 'emily.watson@gmail.com', phone: '+1-555-0302', role: 'PATIENT', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000009', auth_user_id: 'auth-pat-3', name: 'Michael Jordan', email: 'michael.jordan@gmail.com', phone: '+1-555-0303', role: 'PATIENT', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000012', auth_user_id: 'auth-pat-4', name: 'Sophia Chen', email: 'sophia.chen@gmail.com', phone: '+1-555-0304', role: 'PATIENT', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000013', auth_user_id: 'auth-pat-5', name: 'Carlos Rodriguez', email: 'carlos.r@gmail.com', phone: '+1-555-0305', role: 'PATIENT', created_at: new Date().toISOString() },
    { id: 'p1000000-0000-0000-0000-000000000014', auth_user_id: 'auth-pat-6', name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '+1-555-0306', role: 'PATIENT', created_at: new Date().toISOString() }
  ],

  doctors: [
    { id: 'doc11111-1111-1111-1111-111111111111', profile_id: 'p1000000-0000-0000-0000-000000000003', department_id: 'd1111111-1111-1111-1111-111111111111', specialization: 'Interventional Cardiology', qualification: 'MD, FACC', experience_years: 14, consultation_fee: 150.00, availability_status: 'AVAILABLE', languages: ['English', 'Mandarin', 'Cantonese'], slot_duration_mins: 15, availability_duration: '15 mins', next_available: 'Available in 15 mins' },
    { id: 'doc22222-2222-2222-2222-222222222222', profile_id: 'p1000000-0000-0000-0000-000000000004', department_id: 'd2222222-2222-2222-2222-222222222222', specialization: 'Clinical Dermatology & Cosmetology', qualification: 'MD, FAAD', experience_years: 9, consultation_fee: 120.00, availability_status: 'AVAILABLE', languages: ['English', 'Spanish', 'Russian'], slot_duration_mins: 30, availability_duration: '30 mins', next_available: 'Available in 30 mins' },
    { id: 'doc33333-3333-3333-3333-333333333333', profile_id: 'p1000000-0000-0000-0000-000000000005', department_id: 'd3333333-3333-3333-3333-333333333333', specialization: 'Neurophysiology & Epilepsy', qualification: 'MD, DM Neurology', experience_years: 12, consultation_fee: 180.00, availability_status: 'AVAILABLE', languages: ['English', 'French', 'German'], slot_duration_mins: 45, availability_duration: '45 mins', next_available: 'Available in 45 mins' },
    { id: 'doc44444-4444-4444-4444-444444444444', profile_id: 'p1000000-0000-0000-0000-000000000006', department_id: 'd4444444-4444-4444-4444-444444444444', specialization: 'Pediatric Care & Immunology', qualification: 'MD Pediatrics', experience_years: 8, consultation_fee: 100.00, availability_status: 'AVAILABLE', languages: ['English', 'Hindi', 'Gujarati'], slot_duration_mins: 15, availability_duration: '15 mins', next_available: 'Available in 15 mins' },
    { id: 'doc55555-5555-5555-5555-555555555555', profile_id: 'p1000000-0000-0000-0000-000000000010', department_id: 'd5555555-5555-5555-5555-555555555555', specialization: 'General Practice & Family Health', qualification: 'MD Internal Medicine', experience_years: 10, consultation_fee: 90.00, availability_status: 'AVAILABLE', languages: ['English', 'Spanish', 'Tagalog'], slot_duration_mins: 30, availability_duration: '30 mins', next_available: 'Available in 30 mins' },
    { id: 'doc66666-6666-6666-6666-666666666666', profile_id: 'p1000000-0000-0000-0000-000000000011', department_id: 'd1111111-1111-1111-1111-111111111111', specialization: 'Cardiovascular Surgery & Care', qualification: 'MS, FRCS Cardiology', experience_years: 16, consultation_fee: 200.00, availability_status: 'AVAILABLE', languages: ['English', 'Arabic', 'French'], slot_duration_mins: 60, availability_duration: '60 mins', next_available: 'Available in 60 mins' }
  ],

  patients: [
    {
      id: 'pat11111-1111-1111-1111-111111111111',
      profile_id: 'p1000000-0000-0000-0000-000000000007',
      date_of_birth: '1988-05-14',
      gender: 'MALE',
      phone: '+1-555-0301',
      address: '123 Pine St, Cityville',
      emergency_contact: '+1-555-9901 (Wife)',
      blood_group: 'O+',
      primary_specialty: 'Cardiology',
      languages: ['English', 'Spanish'],
      consultation_duration: '15 mins',
      slot_duration_mins: 15,
      medical_history: {
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
          },
          {
            id: 'surg-302',
            surgery_name: 'Arthroscopic Knee Meniscectomy',
            surgery_date: '2022-06-30',
            hospital: 'Metro Orthopedic Surgical Center',
            surgeon: 'Dr. Sarah Jenkins',
            notes: 'Partial medial meniscectomy right knee. Completed 6 weeks physical therapy.'
          }
        ]
      }
    },
    {
      id: 'pat22222-2222-2222-2222-222222222222',
      profile_id: 'p1000000-0000-0000-0000-000000000008',
      date_of_birth: '1992-11-20',
      gender: 'FEMALE',
      phone: '+1-555-0302',
      address: '456 Oak Ave, Townsville',
      emergency_contact: '+1-555-9902 (Mother)',
      blood_group: 'A+',
      primary_specialty: 'Dermatology',
      languages: ['English', 'French'],
      consultation_duration: '30 mins',
      slot_duration_mins: 30,
      medical_history: {
        diagnoses: [
          {
            id: 'diag-201',
            condition: 'Atopic Dermatitis (Eczema)',
            diagnosed_date: '2020-02-10',
            status: 'CHRONIC',
            severity: 'MILD',
            doctor_notes: 'Triggered by cold weather and dry air. Topical hydrocortisone prescribed.'
          }
        ],
        allergies: [
          {
            id: 'alg-203',
            allergen: 'Peanuts & Tree Nuts',
            reaction: 'Swelling of lips and facial hives',
            severity: 'SEVERE',
            identified_date: '2010-05-15'
          }
        ],
        surgeries: [
          {
            id: 'surg-303',
            surgery_name: 'Wisdom Teeth Extraction (4 Molars)',
            surgery_date: '2016-12-05',
            hospital: 'Townsville Dental Surgical Care',
            surgeon: 'Dr. Michael Chang',
            notes: 'Impacted third molars extracted under IV sedation. Smooth recovery.'
          }
        ]
      }
    },
    {
      id: 'pat33333-3333-3333-3333-333333333333',
      profile_id: 'p1000000-0000-0000-0000-000000000009',
      date_of_birth: '1975-03-30',
      gender: 'MALE',
      phone: '+1-555-0303',
      address: '789 Maple Rd, Metropolis',
      emergency_contact: '+1-555-9903 (Brother)',
      blood_group: 'B-',
      primary_specialty: 'Neurology',
      languages: ['English', 'German'],
      consultation_duration: '45 mins',
      slot_duration_mins: 45,
      medical_history: {
        diagnoses: [
          {
            id: 'diag-301',
            condition: 'Migraine with Aura',
            diagnosed_date: '2019-07-22',
            status: 'CHRONIC',
            severity: 'MODERATE',
            doctor_notes: 'Visual aura preceding throbbing headache. Sumatriptan prescribed.'
          }
        ],
        allergies: [
          {
            id: 'alg-204',
            allergen: 'Sulfa Drugs (Sulfonamides)',
            reaction: 'Widespread skin rash and fever',
            severity: 'MODERATE',
            identified_date: '2017-03-11'
          }
        ],
        surgeries: []
      }
    },
    {
      id: 'pat44444-4444-4444-4444-444444444444',
      profile_id: 'p1000000-0000-0000-0000-000000000012',
      date_of_birth: '2018-02-12',
      gender: 'FEMALE',
      phone: '+1-555-0304',
      address: '321 Cedar Blvd, Bay City',
      emergency_contact: '+1-555-9904 (Father)',
      blood_group: 'AB+',
      primary_specialty: 'Pediatrics',
      languages: ['Mandarin', 'English'],
      consultation_duration: '15 mins',
      slot_duration_mins: 15,
      medical_history: {
        diagnoses: [
          {
            id: 'diag-401',
            condition: 'Pediatric Asthma & Rhinitis',
            diagnosed_date: '2022-09-01',
            status: 'CHRONIC',
            severity: 'MILD',
            doctor_notes: 'Requires inhaler prior to physical exercise.'
          }
        ],
        allergies: [],
        surgeries: []
      }
    },
    {
      id: 'pat55555-5555-5555-5555-555555555555',
      profile_id: 'p1000000-0000-0000-0000-000000000013',
      date_of_birth: '1985-08-25',
      gender: 'MALE',
      phone: '+1-555-0305',
      address: '88 Westlake Way, Lakeshore',
      emergency_contact: '+1-555-9905 (Sister)',
      blood_group: 'O-',
      primary_specialty: 'General Medicine',
      languages: ['Spanish', 'English', 'Tagalog'],
      consultation_duration: '30 mins',
      slot_duration_mins: 30,
      medical_history: {
        diagnoses: [
          {
            id: 'diag-501',
            condition: 'Type 2 Diabetes Mellitus',
            diagnosed_date: '2021-11-15',
            status: 'CHRONIC',
            severity: 'MODERATE',
            doctor_notes: 'Controlled with Metformin 500mg. Quarterly HbA1c check required.'
          }
        ],
        allergies: [],
        surgeries: []
      }
    },
    {
      id: 'pat66666-6666-6666-6666-666666666666',
      profile_id: 'p1000000-0000-0000-0000-000000000014',
      date_of_birth: '1990-04-05',
      gender: 'FEMALE',
      phone: '+1-555-0306',
      address: '55 Ocean View Dr, Sunset Coast',
      emergency_contact: '+1-555-9906 (Husband)',
      blood_group: 'A-',
      primary_specialty: 'Cardiology',
      languages: ['Hindi', 'English', 'Punjabi'],
      consultation_duration: '60 mins',
      slot_duration_mins: 60,
      medical_history: {
        diagnoses: [
          {
            id: 'diag-601',
            condition: 'Sinus Tachycardia & Palpitations',
            diagnosed_date: '2023-05-20',
            status: 'CHRONIC',
            severity: 'MILD',
            doctor_notes: 'Holter monitor completed. Recommend stress management.'
          }
        ],
        allergies: [],
        surgeries: []
      }
    }
  ],

  schedules: [
    { id: 'sch1', doctor_id: 'doc11111-1111-1111-1111-111111111111', day_of_week: 'MONDAY', start_time: '09:00:00', end_time: '13:00:00', slot_duration: 30, is_available: true },
    { id: 'sch2', doctor_id: 'doc11111-1111-1111-1111-111111111111', day_of_week: 'WEDNESDAY', start_time: '09:00:00', end_time: '13:00:00', slot_duration: 30, is_available: true },
    { id: 'sch3', doctor_id: 'doc11111-1111-1111-1111-111111111111', day_of_week: 'FRIDAY', start_time: '09:00:00', end_time: '13:00:00', slot_duration: 30, is_available: true },
    { id: 'sch4', doctor_id: 'doc22222-2222-2222-2222-222222222222', day_of_week: 'TUESDAY', start_time: '10:00:00', end_time: '16:00:00', slot_duration: 30, is_available: true },
    { id: 'sch5', doctor_id: 'doc22222-2222-2222-2222-222222222222', day_of_week: 'THURSDAY', start_time: '10:00:00', end_time: '16:00:00', slot_duration: 30, is_available: true },
    { id: 'sch6', doctor_id: 'doc33333-3333-3333-3333-333333333333', day_of_week: 'MONDAY', start_time: '14:00:00', end_time: '18:00:00', slot_duration: 30, is_available: true },
    { id: 'sch7', doctor_id: 'doc33333-3333-3333-3333-333333333333', day_of_week: 'THURSDAY', start_time: '14:00:00', end_time: '18:00:00', slot_duration: 30, is_available: true },
    { id: 'sch8', doctor_id: 'doc44444-4444-4444-4444-444444444444', day_of_week: 'WEDNESDAY', start_time: '09:00:00', end_time: '15:00:00', slot_duration: 30, is_available: true },
    { id: 'sch9', doctor_id: 'doc44444-4444-4444-4444-444444444444', day_of_week: 'FRIDAY', start_time: '09:00:00', end_time: '15:00:00', slot_duration: 30, is_available: true }
  ],

  appointments: [
    {
      id: 'apt11111-1111-1111-1111-111111111111',
      patient_id: 'pat11111-1111-1111-1111-111111111111',
      doctor_id: 'doc11111-1111-1111-1111-111111111111',
      department_id: 'd1111111-1111-1111-1111-111111111111',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '09:30:00',
      reason: 'Routine Cardiac Checkup',
      symptoms: 'Mild chest discomfort during exertion',
      priority: 'NORMAL',
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    },
    {
      id: 'apt22222-2222-2222-2222-222222222222',
      patient_id: 'pat22222-2222-2222-2222-222222222222',
      doctor_id: 'doc22222-2222-2222-2222-222222222222',
      department_id: 'd2222222-2222-2222-2222-222222222222',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:30:00',
      reason: 'Skin Allergy Consultation',
      symptoms: 'Red rashes on arms',
      priority: 'URGENT',
      status: 'PENDING',
      created_at: new Date().toISOString()
    },
    {
      id: 'apt33333-3333-3333-3333-333333333333',
      patient_id: 'pat33333-3333-3333-3333-333333333333',
      doctor_id: 'doc33333-3333-3333-3333-333333333333',
      department_id: 'd3333333-3333-3333-3333-333333333333',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '14:30:00',
      reason: 'Frequent Migraines',
      symptoms: 'Throbbing headache and light sensitivity',
      priority: 'NORMAL',
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    }
  ],

  queues: [
    {
      id: 'que11111-1111-1111-1111-111111111111',
      appointment_id: 'apt11111-1111-1111-1111-111111111111',
      doctor_id: 'doc11111-1111-1111-1111-111111111111',
      patient_id: 'pat11111-1111-1111-1111-111111111111',
      queue_number: 1,
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      joined_at: new Date().toISOString(),
      checked_in_at: new Date().toISOString(),
      called_at: new Date().toISOString()
    }
  ],

  patient_qr_tokens: [
    {
      id: 'qrt11111-1111-1111-1111-111111111111',
      patient_id: 'pat11111-1111-1111-1111-111111111111',
      token: 'CP-PAT-1001-TOKEN',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'qrt22222-2222-2222-2222-222222222222',
      patient_id: 'pat22222-2222-2222-2222-222222222222',
      token: 'CP-PAT-1002-TOKEN',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'qrt33333-3333-3333-3333-333333333333',
      patient_id: 'pat33333-3333-3333-3333-333333333333',
      token: 'CP-PAT-1003-TOKEN',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],

  prescriptions: [
    {
      id: 'rx111111-1111-1111-1111-111111111111',
      appointment_id: 'apt11111-1111-1111-1111-111111111111',
      patient_id: 'pat11111-1111-1111-1111-111111111111',
      doctor_id: 'doc11111-1111-1111-1111-111111111111',
      diagnosis: 'Essential Hypertension & Cardiac Strain',
      instructions: 'Maintain low-sodium diet and log morning BP daily.',
      created_at: new Date().toISOString()
    }
  ],

  prescription_items: [
    {
      id: 'rxi11111-1111-1111-1111-111111111111',
      prescription_id: 'rx111111-1111-1111-1111-111111111111',
      medicine_name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning with food',
      created_at: new Date().toISOString()
    },
    {
      id: 'rxi22222-2222-2222-2222-222222222222',
      prescription_id: 'rx111111-1111-1111-1111-111111111111',
      medicine_name: 'Aspirin Low Dose',
      dosage: '81mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take after dinner',
      created_at: new Date().toISOString()
    }
  ],

  refunds: [
    {
      id: 'ref11111-1111-1111-1111-111111111111',
      appointment_id: 'apt22222-2222-2222-2222-222222222222',
      patient_id: 'pat22222-2222-2222-2222-222222222222',
      original_amount: 120.00,
      cancellation_fee: 12.00,
      refund_amount: 108.00,
      refund_percentage: 90,
      cancellation_reason: 'Schedule conflict reported >24 hours prior',
      cancelled_by: 'p1000000-0000-0000-0000-000000000008',
      refund_status: 'COMPLETED',
      created_at: new Date().toISOString()
    }
  ],

  notifications: [
    {
      id: 'notif1',
      user_id: 'p1000000-0000-0000-0000-000000000007',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Robert Chen is confirmed for today at 09:30 AM.',
      type: 'SUCCESS',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'notif2',
      user_id: 'p1000000-0000-0000-0000-000000000008',
      title: 'Appointment Pending',
      message: 'Your appointment request with Dr. Elena Rostova is pending approval.',
      type: 'INFO',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ],

  audit_logs: [
    {
      id: 'audit-1',
      user_id: 'p1000000-0000-0000-0000-000000000001',
      action: 'INITIALIZE_SCHEMA_AND_SEED',
      entity: 'SYSTEM',
      entity_id: '00000000-0000-0000-0000-000000000000',
      metadata: { phase: 1, description: "Database schema and seed initialized successfully" },
      created_at: new Date().toISOString()
    }
  ],

  ambulance_config: {
    base_fee: 50.00,
    per_km_fee: 5.00,
    assistance_fee: 25.00,
    service_enabled: true,
    disclaimer_text: "For life-threatening emergencies, contact your local emergency medical services immediately. Do not rely on this application for emergency response."
  },

  ambulances: [
    {
      id: 'amb11111-1111-1111-1111-111111111111',
      vehicle_number: 'AMB-CP-01',
      ambulance_type: 'BASIC',
      status: 'AVAILABLE',
      base_fee: 50.00,
      per_km_fee: 5.00,
      assistance_fee: 25.00,
      driver_name: 'John Driver',
      contact_number: '+1 (555) 019-2831',
      created_at: new Date().toISOString()
    },
    {
      id: 'amb22222-2222-2222-2222-222222222222',
      vehicle_number: 'AMB-CP-02',
      ambulance_type: 'ASSISTED',
      status: 'AVAILABLE',
      base_fee: 75.00,
      per_km_fee: 6.50,
      assistance_fee: 40.00,
      driver_name: 'Sarah Paramedic',
      contact_number: '+1 (555) 019-4820',
      created_at: new Date().toISOString()
    },
    {
      id: 'amb33333-3333-3333-3333-333333333333',
      vehicle_number: 'AMB-CP-03',
      ambulance_type: 'ADVANCED',
      status: 'MAINTENANCE',
      base_fee: 100.00,
      per_km_fee: 8.00,
      assistance_fee: 60.00,
      driver_name: 'Michael Responder',
      contact_number: '+1 (555) 019-9921',
      created_at: new Date().toISOString()
    }
  ],

  ambulance_requests: [
    {
      id: 'amr11111-1111-1111-1111-111111111111',
      appointment_id: 'apt11111-1111-1111-1111-111111111111',
      patient_id: 'pat11111-1111-1111-1111-111111111111',
      ambulance_id: 'amb11111-1111-1111-1111-111111111111',
      pickup_address: '742 Evergreen Terrace, Springfield',
      destination: 'CarePulse Central Hospital - Main Medical Wing',
      assistance_required: 'ASSISTED',
      reason: 'Patient experiences mild mobility limitation following cardiac consultation.',
      contact_number: '+1 (555) 019-2831',
      estimated_distance: 8.5,
      estimated_fee: 117.50,
      final_fee: 117.50,
      status: 'AMBULANCE_ASSIGNED',
      notes: 'Wheelchair ramp required upon arrival',
      disclaimer_acknowledged: true,
      requested_at: new Date().toISOString(),
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ]
};

export const mockStore = mockData;


