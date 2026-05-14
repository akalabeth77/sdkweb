import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import { saveAuth } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import type { AppUser } from '@/lib/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://sdkweb.vercel.app';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
const hasGoogleAuth = Boolean(WEB_CLIENT_ID);

// Google OAuth goes through our backend proxy — no custom scheme in Google Console needed
const GOOGLE_START_URL = `${BASE_URL}/api/auth/google/mobile`;
const APP_CALLBACK_SCHEME = 'sdkapp://oauth2callback';

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Chyba', 'Vyplň email a heslo.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await api.auth.login(email.trim().toLowerCase(), password);
      await saveAuth(token, user);
      setUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Prihlásenie zlyhalo.';
      Alert.alert('Chyba prihlásenia', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        GOOGLE_START_URL,
        APP_CALLBACK_SCHEME
      );

      if (result.type !== 'success') {
        return; // user cancelled
      }

      // Parse params from redirect: sdkapp://oauth2callback?token=xxx&...
      const queryString = result.url.split('?')[1] ?? '';
      const params = new URLSearchParams(queryString);

      if (params.get('pending') === 'true') {
        Alert.alert(
          'Čaká sa na schválenie',
          'Tvoj účet bol vytvorený a čaká na schválenie administrátora. Po schválení dostaneš email.'
        );
        return;
      }

      const errorParam = params.get('error');
      if (errorParam) {
        const messages: Record<string, string> = {
          rejected: 'Tvoj účet nebol schválený.',
          cancelled: 'Prihlásenie bolo zrušené.',
          not_configured: 'Google prihlásenie nie je nakonfigurované.',
        };
        Alert.alert('Chyba', messages[errorParam] ?? 'Google prihlásenie zlyhalo.');
        return;
      }

      const token = params.get('token');
      if (!token) {
        Alert.alert('Chyba', 'Neplatná odpoveď zo servera.');
        return;
      }

      const user: AppUser = {
        id: params.get('id') ?? '',
        email: params.get('email') ?? '',
        name: params.get('name') ?? '',
        role: (params.get('role') ?? 'member') as AppUser['role'],
      };

      await saveAuth(token, user);
      setUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Google prihlásenie zlyhalo.';
      Alert.alert('Chyba', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.brand}>Swing Dance Košice</Text>
        <Text style={styles.title}>Prihlásenie</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Heslo"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Prihlásiť sa</Text>}
        </TouchableOpacity>

        {hasGoogleAuth && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>alebo</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>🔵  Prihlásiť sa cez Google</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
          <Text style={styles.linkText}>Nemáš účet? Registruj sa</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 28 },
  brand: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: '#1a1a2e', marginBottom: 36 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, marginBottom: 14, fontSize: 16, color: '#1a1a2e', backgroundColor: '#fafafa' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 17, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#aaa' },
  googleButton: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, alignItems: 'center', backgroundColor: '#fff' },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#1a1a2e', fontSize: 14, textDecorationLine: 'underline' },
});
