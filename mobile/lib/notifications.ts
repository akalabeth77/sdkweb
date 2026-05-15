import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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

  // projectId is required for standalone APKs in Expo SDK 49+
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

  const tokenResult = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  ).catch((e) => {
    console.warn('[push] getExpoPushTokenAsync failed:', e?.message ?? e);
    return null;
  });

  if (!tokenResult) return;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  await api.devices.register(platform, tokenResult.data).catch((e) => {
    console.warn('[push] device register failed:', e?.message ?? e);
  });
}
