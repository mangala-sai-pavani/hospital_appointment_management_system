import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('hospital_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res && res.user) {
          setUser(res.user);
          // Also fetch full profile
          const profRes = await api.get('/profile');
          if (profRes && profRes.profile) {
            setProfile(profRes.profile);
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('hospital_auth_token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.session && data.session.access_token) {
      localStorage.setItem('hospital_auth_token', data.session.access_token);
    }
    setProfile(data.profile);
    setUser(data.user);
    return data.profile;
  };

  const register = async (patientData) => {
    // Role is strictly locked to PATIENT
    const data = await api.post('/auth/register', { ...patientData, role: 'PATIENT' });
    if (data.session && data.session.access_token) {
      localStorage.setItem('hospital_auth_token', data.session.access_token);
    }
    setProfile(data.profile);
    setUser(data.user);
    return data.profile;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API call notice:', err);
    } finally {
      localStorage.removeItem('hospital_auth_token');
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfileData = async (updatedFields) => {
    const res = await api.patch('/profile', updatedFields);
    if (res && res.profile) {
      setProfile(res.profile);
    }
    return res.profile;
  };

  const value = {
    user,
    profile,
    role: profile?.role || user?.role || 'GUEST',
    loading,
    login,
    register,
    logout,
    updateProfile: updateProfileData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
