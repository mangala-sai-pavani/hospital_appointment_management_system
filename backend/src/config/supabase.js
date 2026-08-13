import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && 
  process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
