import { createClient } from '@supabase/supabase-js';

export const UNIVERSITY_DOMAIN = 'uniteduniversity.edu.in';

/**
 * Normalizes email: trims whitespace and converts to lowercase
 */
export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

/**
 * Validates standard email address format (accepts all valid emails including @gmail.com)
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

/**
 * Validates whether email belongs to university domain
 */
export function isUniversityEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  return parts[1] === UNIVERSITY_DOMAIN;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check whether Supabase is configured with genuine credentials
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim().length > 0 &&
  supabaseAnonKey.trim().length > 0 &&
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseAnonKey.includes('YOUR_ANON_KEY') &&
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))
);

// Initialize Supabase Client if credentials are provided
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Authenticate with Email and Password via Supabase Auth
 */
export async function signInWithUniversityEmail(email, password) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Authentication is not configured yet. Please contact the administrator.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password: password,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('invalid login credentials') || error.status === 400) {
      throw new Error('Invalid email or password.');
    }
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error('Please verify your email before continuing.');
    }
    throw new Error(error.message || 'Invalid email or password.');
  }

  return data;
}

/**
 * Check if Google OAuth provider is enabled in the Supabase project
 */
export async function isGoogleProviderEnabled() {
  if (!isSupabaseConfigured || !supabaseUrl) return false;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { 'apikey': supabaseAnonKey }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.external?.google);
  } catch (e) {
    return false;
  }
}

/**
 * Trigger Google OAuth Single Sign-On via Supabase Auth (Allows any Google account)
 */
export async function signInWithGoogleOAuth() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Authentication is not configured yet. Please contact the administrator.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to initiate Google authentication.');
  }

  return data;
}

/**
 * Validate active session from OAuth or page reload
 */
export async function validateActiveSupabaseSession() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !session.user) {
    return null;
  }

  return session;
}
