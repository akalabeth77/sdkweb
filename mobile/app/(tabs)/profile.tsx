import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { clearAuth } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  member: 'Člen',
  guest: 'Hosť',
};

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  useEffect(() => {
    api.preferences.get()
      .then((p) => { setEmailNotif(p.emailNotifications); setPushNotif(p.pushNotifications); })
      .catch(() => {});
  }, []);

  async function toggleEmail(val: boolean) {
    setEmailNotif(val);
    await api.preferences.update({ emailNotifications: val, pushNotifications: pushNotif }).catch(() => {});
  }

  async function togglePush(val: boolean) {
    setPushNotif(val);
    await api.preferences.update({ emailNotifications: emailNotif, pushNotifications: val }).catch(() => {});
  }

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
        <Text style={styles.sectionTitle}>Notifikácie</Text>
        <View style={styles.notifRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifLabel}>Emailové notifikácie</Text>
            <Text style={styles.notifSub}>Nové eventy, články, galéria</Text>
          </View>
          <Switch value={emailNotif} onValueChange={(v) => void toggleEmail(v)} trackColor={{ true: '#1a1a2e' }} />
        </View>
        <View style={styles.notifRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifLabel}>Push notifikácie</Text>
            <Text style={styles.notifSub}>Upozornenia v appke</Text>
          </View>
          <Switch value={pushNotif} onValueChange={(v) => void togglePush(v)} trackColor={{ true: '#1a1a2e' }} />
        </View>
      </View>

      <View style={[styles.section, { marginTop: 16 }]}>
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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start', marginBottom: 8 },
  notifRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  notifLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  notifSub: { fontSize: 12, color: '#888', marginTop: 2 },
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
