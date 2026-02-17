import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { authStorage } from './authStorage';

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const configuredSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  configuredSupabaseUrl.length > 0 && configuredSupabaseAnonKey.length > 0;

// Keep the app bootable without env config. Auth calls will fail gracefully
// with a user-facing setup error instead of crashing at startup.
const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseAnonKey = 'public-anon-key-not-configured';
const supabaseUrl = isSupabaseConfigured ? configuredSupabaseUrl : fallbackSupabaseUrl;
const supabaseAnonKey = isSupabaseConfigured
  ? configuredSupabaseAnonKey
  : fallbackSupabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase URL or anon key not configured. Copy .env.example to .env and fill in your values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
