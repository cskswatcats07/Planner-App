import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthStore {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    const AUTH_INIT_TIMEOUT_MS = 8000;

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });

    const timeoutId = setTimeout(() => {
      set((s) => {
        if (s.isInitialized) return s;
        return { isLoading: false, isInitialized: true };
      });
    }, AUTH_INIT_TIMEOUT_MS);

    try {
      const { data } = await supabase.auth.getSession();
      clearTimeout(timeoutId);
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });
    } catch {
      clearTimeout(timeoutId);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));
