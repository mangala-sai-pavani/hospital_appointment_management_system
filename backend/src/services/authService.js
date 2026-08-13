import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { mockData } from '../utils/mockStore.js';

export async function loginUser(email, password) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // Fetch profile
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profErr) throw new Error('Profile record not found for this account');

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role
      },
      session: data.session,
      profile
    };
  } else {
    // Fallback login matching mock profiles
    const profile = mockData.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
      throw new Error('Invalid email or password');
    }
    return {
      user: {
        id: profile.auth_user_id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      },
      session: {
        access_token: `mock-token-${profile.id}`,
        refresh_token: `mock-refresh-${profile.id}`,
        user: { id: profile.auth_user_id }
      },
      profile
    };
  }
}

export async function registerPatient(data) {
  // STRICT RULE: Force role to PATIENT. Never trust role received in request.
  const role = 'PATIENT';
  const { name, email, password, phone, date_of_birth, gender, address, blood_group, emergency_contact } = data;

  if (isSupabaseConfigured) {
    // Check if profile/email already exists
    const { data: existingProf } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProf) {
      throw new Error('An account with this email address already exists.');
    }

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (authErr) throw new Error(authErr.message);

    // Create profile
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .insert([{ auth_user_id: authData.user.id, name, email, phone, role }])
      .select()
      .single();

    if (profErr) throw new Error(profErr.message);

    // Create patient record
    const { data: patient, error: patErr } = await supabase
      .from('patients')
      .insert([{
        profile_id: profile.id,
        date_of_birth,
        gender: gender || 'MALE',
        phone,
        address,
        blood_group: blood_group || 'O+',
        emergency_contact
      }])
      .select()
      .single();

    if (patErr) throw new Error(patErr.message);

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile.name,
        role: profile.role
      },
      session: authData.session || { access_token: `token-${profile.id}` },
      profile,
      patient
    };
  } else {
    // Fallback Mock Store Registration
    const existing = mockData.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newProfId = `p-${Date.now()}`;
    const newPatId = `pat-${Date.now()}`;
    const authUserId = `auth-${Date.now()}`;

    const profile = {
      id: newProfId,
      auth_user_id: authUserId,
      name,
      email,
      phone,
      role: 'PATIENT',
      created_at: new Date().toISOString()
    };
    const patient = {
      id: newPatId,
      profile_id: newProfId,
      date_of_birth,
      gender: gender || 'MALE',
      phone,
      address,
      blood_group: blood_group || 'O+',
      emergency_contact,
      created_at: new Date().toISOString()
    };

    mockData.profiles.push(profile);
    mockData.patients.push(patient);

    return {
      user: {
        id: profile.auth_user_id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      },
      session: {
        access_token: `mock-token-${profile.id}`,
        refresh_token: `mock-refresh-${profile.id}`,
        user: { id: profile.auth_user_id }
      },
      profile,
      patient
    };
  }
}

export async function getProfileByToken(token) {
  if (!token) return null;

  if (isSupabaseConfigured) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Invalid or expired authentication session');

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profErr || !profile) throw new Error('User profile record not found');
    return profile;
  } else {
    const profId = token.replace('mock-token-', '');
    const profile = mockData.profiles.find(p => p.id === profId || p.auth_user_id === token);
    if (!profile) {
      // Default fallback mock profile
      return mockData.profiles[0];
    }
    return profile;
  }
}

export async function logoutUser(token) {
  if (isSupabaseConfigured && token) {
    await supabase.auth.signOut();
  }
  return { success: true, message: 'Logged out successfully' };
}

export async function updateProfile(authUserId, updateData, callerRole) {
  // Prevent role escalation or forbidden field mutations
  const forbiddenFields = ['role', 'permissions', 'id', 'auth_user_id', 'created_at', 'updated_at', 'email'];
  const sanitized = {};

  Object.keys(updateData).forEach(key => {
    if (!forbiddenFields.includes(key)) {
      sanitized[key] = updateData[key];
    }
  });

  // If caller is trying to change role and is not ADMIN, throw error
  if (updateData.role && callerRole !== 'ADMIN') {
    throw new Error('Unauthorized attempt to modify security role');
  }

  if (isSupabaseConfigured) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(sanitized)
      .eq('auth_user_id', authUserId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return profile;
  } else {
    const profileIndex = mockData.profiles.findIndex(p => p.auth_user_id === authUserId || p.id === authUserId);
    if (profileIndex === -1) throw new Error('Profile not found');

    mockData.profiles[profileIndex] = {
      ...mockData.profiles[profileIndex],
      ...sanitized,
      updated_at: new Date().toISOString()
    };
    return mockData.profiles[profileIndex];
  }
}

/**
 * Admin Creation of Privileged Staff Users (DOCTOR, RECEPTIONIST, ADMIN)
 */
export async function createStaffUser(adminProfileId, staffData) {
  const { role, name, email, password, phone, department_id, specialization, qualification, experience_years, consultation_fee, room_number, employee_id } = staffData;

  if (!['DOCTOR', 'RECEPTIONIST', 'ADMIN'].includes(role)) {
    throw new Error('Invalid privileged role specified');
  }

  if (isSupabaseConfigured) {
    // Check duplicate email
    const { data: existingProf } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProf) throw new Error('User with this email already exists');

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (authErr) throw new Error(authErr.message);

    // Insert profile
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .insert([{ auth_user_id: authData.user.id, name, email, phone, role }])
      .select()
      .single();

    if (profErr) throw new Error(profErr.message);

    // Insert role-specific record
    let roleRecord = null;
    if (role === 'DOCTOR') {
      const { data: doc, error: docErr } = await supabase
        .from('doctors')
        .insert([{
          profile_id: profile.id,
          department_id,
          specialization,
          qualification,
          experience_years: experience_years || 5,
          consultation_fee: consultation_fee || 500,
          room_number
        }])
        .select()
        .single();
      if (docErr) throw new Error(docErr.message);
      roleRecord = doc;
    } else if (role === 'RECEPTIONIST') {
      const { data: rec, error: recErr } = await supabase
        .from('receptionists')
        .insert([{
          profile_id: profile.id,
          employee_id: employee_id || `EMP-${Date.now().toString().slice(-4)}`
        }])
        .select()
        .single();
      if (recErr) throw new Error(recErr.message);
      roleRecord = rec;
    }

    // Insert audit log
    await supabase.from('audit_logs').insert([{
      user_id: adminProfileId,
      action: 'CREATE_STAFF_USER',
      entity_type: 'USER',
      entity_id: profile.id,
      details: { created_email: email, assigned_role: role }
    }]);

    return { profile, roleRecord };
  } else {
    const existing = mockData.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('User with this email already exists');

    const newProfId = `p-${Date.now()}`;
    const authUserId = `auth-staff-${Date.now()}`;
    const profile = {
      id: newProfId,
      auth_user_id: authUserId,
      name,
      email,
      phone,
      role,
      created_at: new Date().toISOString()
    };

    mockData.profiles.push(profile);

    let roleRecord = null;
    if (role === 'DOCTOR') {
      roleRecord = {
        id: `d-${Date.now()}`,
        profile_id: newProfId,
        department_id,
        specialization,
        qualification,
        experience_years: experience_years || 5,
        consultation_fee: consultation_fee || 500,
        room_number
      };
      mockData.doctors.push(roleRecord);
    } else if (role === 'RECEPTIONIST') {
      roleRecord = {
        id: `r-${Date.now()}`,
        profile_id: newProfId,
        employee_id: employee_id || `EMP-${Date.now().toString().slice(-4)}`
      };
      mockData.receptionists.push(roleRecord);
    }

    // Add mock audit log
    if (!mockData.audit_logs) mockData.audit_logs = [];
    mockData.audit_logs.push({
      id: `audit-${Date.now()}`,
      user_id: adminProfileId,
      action: 'CREATE_STAFF_USER',
      entity_type: 'USER',
      entity_id: profile.id,
      details: JSON.stringify({ created_email: email, assigned_role: role }),
      timestamp: new Date().toISOString()
    });

    return { profile, roleRecord };
  }
}
