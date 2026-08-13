-- CarePulse Health - Hospital Appointment Management System Database Schema
-- Supabase PostgreSQL Compatible Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    specialization TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years INT DEFAULT 0 CHECK (experience_years >= 0),
    consultation_fee NUMERIC(10,2) DEFAULT 0.00 CHECK (consultation_fee >= 0),
    availability_status TEXT DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'ON_LEAVE', 'BUSY')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCTOR SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30 CHECK (slot_duration > 0),
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_doctor_day UNIQUE (doctor_id, day_of_week)
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    symptoms TEXT,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'EMERGENCY')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- 7. QUEUES TABLE
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    queue_number INT NOT NULL,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'EMERGENCY')),
    status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 8. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRESCRIPTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    original_amount NUMERIC(10,2) NOT NULL CHECK (original_amount >= 0),
    cancellation_fee NUMERIC(10,2) NOT NULL CHECK (cancellation_fee >= 0),
    refund_amount NUMERIC(10,2) NOT NULL CHECK (refund_amount >= 0),
    refund_percentage INT NOT NULL CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ DEFAULT NOW(),
    refund_status TEXT DEFAULT 'PENDING' CHECK (refund_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PATIENT QR TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.patient_qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_dept ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_doc ON public.appointments(doctor_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_priority ON public.appointments(priority);

CREATE INDEX IF NOT EXISTS idx_queues_doctor_status ON public.queues(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_queues_appointment ON public.queues(appointment_id);
CREATE INDEX IF NOT EXISTS idx_queues_status ON public.queues(status);
CREATE INDEX IF NOT EXISTS idx_queues_priority ON public.queues(priority);
CREATE INDEX IF NOT EXISTS idx_queues_checked_in ON public.queues(checked_in_at);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON public.prescriptions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_refunds_appointment ON public.refunds(appointment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_patient ON public.refunds(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_qr_token ON public.patient_qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_patient_qr_patient ON public.patient_qr_tokens(patient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
-- 14. AMBULANCES TABLE
CREATE TABLE IF NOT EXISTS public.ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number TEXT NOT NULL UNIQUE,
    ambulance_type TEXT DEFAULT 'BASIC' CHECK (ambulance_type IN ('BASIC', 'ASSISTED', 'ADVANCED')),
    status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'ON_TRIP', 'MAINTENANCE', 'UNAVAILABLE')),
    base_fee NUMERIC(10,2) DEFAULT 50.00 CHECK (base_fee >= 0),
    per_km_fee NUMERIC(10,2) DEFAULT 5.00 CHECK (per_km_fee >= 0),
    assistance_fee NUMERIC(10,2) DEFAULT 25.00 CHECK (assistance_fee >= 0),
    driver_name TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AMBULANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    pickup_latitude NUMERIC(10,6),
    pickup_longitude NUMERIC(10,6),
    destination TEXT DEFAULT 'CarePulse Health Main Medical Center',
    assistance_required TEXT DEFAULT 'BASIC' CHECK (assistance_required IN ('BASIC', 'ASSISTED')),
    reason TEXT,
    contact_number TEXT,
    estimated_distance NUMERIC(10,2) DEFAULT 10.0,
    estimated_fee NUMERIC(10,2) NOT NULL CHECK (estimated_fee >= 0),
    final_fee NUMERIC(10,2) CHECK (final_fee >= 0),
    status TEXT DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'UNDER_REVIEW', 'CONFIRMED', 'AMBULANCE_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    notes TEXT,
    disclaimer_acknowledged BOOLEAN DEFAULT TRUE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambulances_status ON public.ambulances(status);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_patient ON public.ambulance_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_apt ON public.ambulance_requests(appointment_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_status ON public.ambulance_requests(status);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_ambulance ON public.ambulance_requests(ambulance_id);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for ambulances" ON public.ambulances;
CREATE POLICY "Enable all for ambulances" ON public.ambulances FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for ambulance_requests" ON public.ambulance_requests;
CREATE POLICY "Enable all for ambulance_requests" ON public.ambulance_requests FOR ALL USING (true);


-- Standard permissive & authenticated RLS policies
DROP POLICY IF EXISTS "Allow public read access to departments" ON public.departments;
CREATE POLICY "Allow public read access to departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to doctors" ON public.doctors;
CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to schedules" ON public.doctor_schedules;
CREATE POLICY "Allow public read access to schedules" ON public.doctor_schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated profiles" ON public.profiles;
CREATE POLICY "Enable all for authenticated profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Patients view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.appointments;
CREATE POLICY "Enable all for authenticated users" ON public.appointments FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for queues" ON public.queues;
CREATE POLICY "Enable all for queues" ON public.queues FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for prescriptions" ON public.prescriptions;
CREATE POLICY "Enable all for prescriptions" ON public.prescriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for prescription_items" ON public.prescription_items;
CREATE POLICY "Enable all for prescription_items" ON public.prescription_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for refunds" ON public.refunds;
CREATE POLICY "Enable all for refunds" ON public.refunds FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for patient_qr_tokens" ON public.patient_qr_tokens;
CREATE POLICY "Enable all for patient_qr_tokens" ON public.patient_qr_tokens FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for notifications" ON public.notifications;
CREATE POLICY "Enable all for notifications" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all for audit logs" ON public.audit_logs;
CREATE POLICY "Enable all for audit logs" ON public.audit_logs FOR ALL USING (true);

