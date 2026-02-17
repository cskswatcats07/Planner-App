import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../store/authStore';
import * as Linking from 'expo-linking';
import { handleIncomingAuthUrl } from '../lib/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl) {
          handleIncomingAuthUrl(initialUrl).catch(() => {
            // Ignore malformed or non-auth deep links.
          });
        }
      })
      .catch(() => {
        // Ignore inability to read initial URL.
      });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingAuthUrl(url).catch(() => {
        // Ignore malformed or non-auth deep links.
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: isDark ? '#1C1C1E' : '#FAFAF8',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </SafeAreaProvider>
  );
}
