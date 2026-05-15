import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestAndRegisterPushToken(): Promise<void> {
  if (Platform.OS === 'web') return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  // Use native FCM device token — works without Expo push service / expo.dev
  const tokenResult = await Notifications.getDevicePushTokenAsync().catch((e: Error) => {
    console.error('[push] getDevicePushTokenAsync failed:', e?.message ?? e);
    return null;
  });

  if (!tokenResult) return;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  await api.devices.register(platform, tokenResult.data).catch((e: Error) => {
    console.error('[push] device register failed:', e?.message ?? e);
  });
}
