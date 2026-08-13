import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

export async function getAllPatients() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('patients').select('*, profiles(*)');
    if (error) throw new Error(error.message);
    return data;
  }
  return mockData.patients.map(pat => ({
    ...pat,
    profiles: mockData.profiles.find(p => p.id === pat.profile_id)
  }));
}

export async function getPatientById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('patients')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const pat = mockData.patients.find(p => p.id === id || p.profile_id === id);
  if (!pat) throw new Error('Patient record not found');
  return {
    ...pat,
    profiles: mockData.profiles.find(p => p.id === pat.profile_id)
  };
}

export async function updatePatientProfile(id, data) {
  if (isSupabaseConfigured) {
    const { data: updated, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  }

  const pat = mockData.patients.find(p => p.id === id || p.profile_id === id);
  if (!pat) throw new Error('Patient not found');
  Object.assign(pat, data);
  return pat;
}
