import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Chyba', 'Vyplň všetky polia.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Chyba', 'Heslo musí mať aspoň 6 znakov.');
      return;
    }
    setLoading(true);
    try {
      await api.auth.register(email.trim().toLowerCase(), name.trim(), password);
      Alert.alert(
        'Registrácia prijatá',
        'Účet čaká na schválenie adminom. Po schválení sa môžeš prihlásiť.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Registrácia zlyhala.';
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrácia</Text>
        <TextInput style={styles.input} placeholder="Meno" placeholderTextColor="#999" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Heslo (min. 6 znakov)" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={handleRegister} />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Vytvoriť účet</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Späť na prihlásenie</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: '#1a1a2e', marginBottom: 36 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, marginBottom: 14, fontSize: 16, color: '#1a1a2e', backgroundColor: '#fafafa' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 17, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#1a1a2e', fontSize: 14, textDecorationLine: 'underline' },
});
