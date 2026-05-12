import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

type AdminLink = { label: string; icon: string; route: string; adminOnly?: boolean };

const LINKS: AdminLink[] = [
  { label: 'Eventy', icon: '📅', route: '/admin/events' },
  { label: 'Schválenie používateľov', icon: '👥', route: '/admin/users', adminOnly: true },
];

export default function AdminTab() {
  const { user } = useAuth();
  if (!user) return null;

  const links = LINKS.filter((l) => !l.adminOnly || user.role === 'admin');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Admin panel</Text>
      <Text style={styles.role}>Prihlásený ako: <Text style={styles.roleBold}>{user.role}</Text></Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.route}
          style={styles.card}
          onPress={() => router.push(link.route as never)}
        >
          <Text style={styles.icon}>{link.icon}</Text>
          <Text style={styles.label}>{link.label}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 26, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  role: { fontSize: 13, color: '#888', marginBottom: 24 },
  roleBold: { fontWeight: '700', color: '#1a1a2e' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: { fontSize: 24, marginRight: 14 },
  label: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  arrow: { fontSize: 22, color: '#999' },
});
