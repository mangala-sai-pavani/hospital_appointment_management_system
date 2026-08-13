import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

export async function getAllDoctors() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profiles(*), departments(*)');
    if (error) throw new Error(error.message);
    return data;
  }

  // Populate mock data with relations
  return mockData.doctors.map(doc => {
    const profile = mockData.profiles.find(p => p.id === doc.profile_id);
    const department = mockData.departments.find(d => d.id === doc.department_id);
    return {
      ...doc,
      profiles: profile,
      departments: department
    };
  });
}

export async function getDoctorById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profiles(*), departments(*), doctor_schedules(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const doc = mockData.doctors.find(d => d.id === id);
  if (!doc) throw new Error('Doctor not found');

  const profile = mockData.profiles.find(p => p.id === doc.profile_id);
  const department = mockData.departments.find(d => d.id === doc.department_id);
  const schedules = mockData.schedules.filter(s => s.doctor_id === doc.id);

  return {
    ...doc,
    profiles: profile,
    departments: department,
    doctor_schedules: schedules
  };
}

export async function createDoctor(data) {
  const { name, email, phone, password, department_id, specialization, qualification, experience_years, consultation_fee } = data;

  if (isSupabaseConfigured) {
    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: password || 'DoctorPass123!',
      options: { data: { name, role: 'DOCTOR' } }
    });
    if (authErr) throw new Error(authErr.message);

    // 2. Profile
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .insert([{ auth_user_id: authData.user.id, name, email, phone, role: 'DOCTOR' }])
      .select()
      .single();
    if (profErr) throw new Error(profErr.message);

    // 3. Doctor record
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .insert([{
        profile_id: profile.id,
        department_id,
        specialization,
        qualification,
        experience_years: Number(experience_years) || 0,
        consultation_fee: Number(consultation_fee) || 0,
        availability_status: 'AVAILABLE'
      }])
      .select()
      .single();
    if (docErr) throw new Error(docErr.message);

    return { doctor, profile };
  } else {
    const profId = `p-${Date.now()}`;
    const docId = `doc-${Date.now()}`;

    const profile = {
      id: profId,
      auth_user_id: `auth-${Date.now()}`,
      name,
      email,
      phone,
      role: 'DOCTOR',
      created_at: new Date().toISOString()
    };

    const doctor = {
      id: docId,
      profile_id: profId,
      department_id,
      specialization,
      qualification,
      experience_years: Number(experience_years) || 0,
      consultation_fee: Number(consultation_fee) || 0,
      availability_status: 'AVAILABLE',
      created_at: new Date().toISOString()
    };

    mockData.profiles.push(profile);
    mockData.doctors.push(doctor);

    return { doctor, profile };
  }
}
