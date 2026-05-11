import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { clearAuth } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  member: 'Člen',
  guest: 'Hosť',
};

export default function ProfileScreen() {
  const { user, setUser } = useAuth();

  if (!user) return null;

  function handleLogout() {
    Alert.alert('Odhlásiť sa', 'Naozaj sa chceš odhlásiť?', [
      { text: 'Zrušiť', style: 'cancel' },
      {
        text: 'Odhlásiť',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          setUser(null);
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{ROLE_LABEL[user.role] ?? user.role}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Odhlásiť sa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 32, backgroundColor: '#f8f8f8' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  initials: { fontSize: 34, color: '#fff', fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 14 },
  roleBadge: {
    backgroundColor: '#e8e8f0',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 40,
  },
  roleText: { fontSize: 13, color: '#1a1a2e', fontWeight: '600' },
  section: { width: '100%', alignItems: 'center' },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
