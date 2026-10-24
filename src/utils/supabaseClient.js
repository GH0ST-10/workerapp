import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function getSupabase() {
  return supabase;
}

// ==================== AUTHENTICATION ====================

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Backend service configuration missing.');
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Backend service configuration missing.');
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Backend service configuration missing.');
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
}

export async function signOutUser() {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return await supabase.auth.getSession();
}

// ==================== ATTENDANCE DATA (PER USER) ====================

export async function fetchUserAttendance(userId) {
  if (!supabase || !userId) return {};

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }

  // Format array to map: { [date]: { type, date, note, id } }
  const recordMap = {};
  if (data) {
    data.forEach(item => {
      recordMap[item.date] = {
        id: item.id,
        type: item.type,
        date: item.date,
        note: item.note || '',
        updatedAt: item.updated_at
      };
    });
  }
  return recordMap;
}

export async function upsertAttendanceRecord(userId, date, type, note = '') {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert({
      user_id: userId,
      date,
      type,
      note: note || '',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving attendance record:', error);
    throw error;
  }
  return data;
}

export async function deleteAttendanceRecord(userId, date) {
  if (!supabase || !userId) return false;

  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  if (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
  return true;
}

// ==================== USER SETTINGS (PER USER) ====================

export async function fetchUserSettings(userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
  if (!data) return null;

  return {
    workerName: data.worker_name || '',
    companyName: data.company_name || '',
    rates: {
      FULL: data.rate_full ?? 500,
      HALF: data.rate_half ?? 300,
      ABSENT: 0
    },
    monthlyTarget: data.monthly_target ?? 15000,
    soundEnabled: data.sound_enabled ?? true,
    theme: data.theme || 'dark'
  };
}

export async function upsertUserSettings(userId, settings) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      worker_name: settings.workerName || '',
      company_name: settings.companyName || '',
      rate_full: settings.rates?.FULL ?? 500,
      rate_half: settings.rates?.HALF ?? 300,
      monthly_target: settings.monthlyTarget ?? 15000,
      sound_enabled: settings.soundEnabled ?? true,
      theme: settings.theme || 'dark',
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
  return data;
}
