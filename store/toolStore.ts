import { create } from 'zustand';
import type { AppModule } from '../types/modules';
import {
  getToolPreferences,
  saveToolPreferences,
  type StoredToolPreferences,
} from '../lib/storage';

interface ToolPreferenceState {
  lastUsedAt?: string;
  pinned?: boolean;
  hidden?: boolean;
}

interface ToolStore {
  isHydrated: boolean;
  preferences: Record<string, ToolPreferenceState>;
  hydrate: () => Promise<void>;
  markUsed: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  setHidden: (id: string, hidden: boolean) => Promise<void>;
}

function toRecord(prefs: StoredToolPreferences): Record<string, ToolPreferenceState> {
  const record: Record<string, ToolPreferenceState> = {};
  for (const pref of prefs) {
    record[pref.id] = {
      lastUsedAt: pref.lastUsedAt,
      pinned: pref.pinned,
      hidden: pref.hidden,
    };
  }
  return record;
}

function toArray(prefs: Record<string, ToolPreferenceState>): StoredToolPreferences {
  return Object.entries(prefs).map(([id, value]) => ({
    id,
    lastUsedAt: value.lastUsedAt,
    pinned: value.pinned,
    hidden: value.hidden,
  }));
}

export const useToolStore = create<ToolStore>((set, get) => ({
  isHydrated: false,
  preferences: {},

  hydrate: async () => {
    if (get().isHydrated) return;
    const stored = await getToolPreferences();
    set({ preferences: toRecord(stored), isHydrated: true });
  },

  markUsed: async (id) => {
    const { preferences } = get();
    const updated: Record<string, ToolPreferenceState> = {
      ...preferences,
      [id]: {
        ...preferences[id],
        lastUsedAt: new Date().toISOString(),
      },
    };
    set({ preferences: updated });
    await saveToolPreferences(toArray(updated));
  },

  togglePinned: async (id) => {
    const { preferences } = get();
    const current = preferences[id]?.pinned ?? false;
    const updated: Record<string, ToolPreferenceState> = {
      ...preferences,
      [id]: {
        ...preferences[id],
        pinned: !current,
      },
    };
    set({ preferences: updated });
    await saveToolPreferences(toArray(updated));
  },

  setHidden: async (id, hidden) => {
    const { preferences } = get();
    const updated: Record<string, ToolPreferenceState> = {
      ...preferences,
      [id]: {
        ...preferences[id],
        hidden,
      },
    };
    set({ preferences: updated });
    await saveToolPreferences(toArray(updated));
  },
}));

export function sortModulesWithPrefs(
  modules: AppModule[],
  prefs: Record<string, ToolPreferenceState>
): AppModule[] {
  return [...modules]
    .filter((m) => !prefs[m.id]?.hidden)
    .sort((a, b) => {
      const pa = prefs[a.id];
      const pb = prefs[b.id];

      // Pinned first
      const pinnedA = pa?.pinned ?? false;
      const pinnedB = pb?.pinned ?? false;
      if (pinnedA !== pinnedB) {
        return pinnedA ? -1 : 1;
      }

      // Recent usage next
      const la = pa?.lastUsedAt ? Date.parse(pa.lastUsedAt) : 0;
      const lb = pb?.lastUsedAt ? Date.parse(pb.lastUsedAt) : 0;
      if (la !== lb) {
        return lb - la;
      }

      // Fallback: original order by name
      return a.name.localeCompare(b.name);
    });
}

