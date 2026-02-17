import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

export type NotificationPermissionState =
  | 'unsupported'
  | 'granted'
  | 'denied'
  | 'undetermined';

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted) return 'granted';

  if (permission.canAskAgain === false) return 'denied';
  return 'undetermined';
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await getNotificationPermissionState();
  if (current === 'granted') return true;
  if (current === 'unsupported') return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function openAppSettings(): Promise<void> {
  await Linking.openSettings();
}
