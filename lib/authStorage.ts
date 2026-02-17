import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_STORAGE_KEY_PREFIX = 'sb';

function isSecureStoreAvailable() {
  return Platform.OS !== 'web';
}

async function getWebItem(key: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage.getItem(key);
}

async function setWebItem(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(key, value);
}

async function removeWebItem(key: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  window.localStorage.removeItem(key);
}

export const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isSecureStoreAvailable()) {
      try {
        return await SecureStore.getItemAsync(`${AUTH_STORAGE_KEY_PREFIX}-${key}`);
      } catch {
        return await AsyncStorage.getItem(key);
      }
    }
    return getWebItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (isSecureStoreAvailable()) {
      try {
        await SecureStore.setItemAsync(`${AUTH_STORAGE_KEY_PREFIX}-${key}`, value);
        return;
      } catch {
        await AsyncStorage.setItem(key, value);
        return;
      }
    }
    await setWebItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (isSecureStoreAvailable()) {
      try {
        await SecureStore.deleteItemAsync(`${AUTH_STORAGE_KEY_PREFIX}-${key}`);
        return;
      } catch {
        await AsyncStorage.removeItem(key);
        return;
      }
    }
    await removeWebItem(key);
  },
};
