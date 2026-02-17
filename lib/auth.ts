import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

function assertSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

export async function signUpWithEmail(email: string, password: string) {
  assertSupabaseConfig();
  const emailRedirectTo = Linking.createURL('/(auth)/login');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  assertSupabaseConfig();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  assertSupabaseConfig();
  const redirectTo = Linking.createURL('/(auth)/login');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) throw error;

  if (Platform.OS !== 'web' && data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      await handleIncomingAuthUrl(result.url);
    }
  }

  return data;
}

export async function handleIncomingAuthUrl(url: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const code = parsedUrl.searchParams.get('code');

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return true;
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return true;
  }

  return false;
}

export async function signOut() {
  assertSupabaseConfig();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  assertSupabaseConfig();
  const redirectTo = Linking.createURL('/(auth)/login');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function getSession() {
  assertSupabaseConfig();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  assertSupabaseConfig();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
