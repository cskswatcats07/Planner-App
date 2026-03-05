import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isInitialized, isLoading, user, router]);

  if (!isInitialized || isLoading || !user) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: isDark ? '#1C1C1E' : '#FAFAF8',
          },
        }}
      />
    </View>
  );
}
