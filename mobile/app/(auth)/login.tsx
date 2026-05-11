import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { saveAuth } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';

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
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#1a1a2e', fontSize: 14, textDecorationLine: 'underline' },
});
