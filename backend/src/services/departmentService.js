import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

export async function getAllDepartments() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
  }
  return mockData.departments;
}

export async function createDepartment(name, description) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('departments').insert([{ name, description }]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const newDept = {
    id: `d-${Date.now()}`,
    name,
    description,
    created_at: new Date().toISOString()
  };
  mockData.departments.push(newDept);
  return newDept;
}
