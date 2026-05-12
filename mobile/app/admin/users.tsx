import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PendingUser } from '@/lib/api';

export default function AdminUsersScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.admin.users.listPending(),
  });

  const users = data?.users ?? [];

  async function handleAction(user: PendingUser, action: 'approve' | 'reject') {
    const label = action === 'approve' ? 'schváliť' : 'zamietnuť';
    Alert.alert(`${action === 'approve' ? 'Schváliť' : 'Zamietnuť'} účet`, `Naozaj chceš ${label} účet ${user.name}?`, [
      { text: 'Zrušiť', style: 'cancel' },
      {
        text: action === 'approve' ? 'Schváliť' : 'Zamietnuť',
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            if (action === 'approve') await api.admin.users.approve(user.id);
            else await api.admin.users.reject(user.id);
            await qc.invalidateQueries({ queryKey: ['admin-users'] });
          } catch {
            Alert.alert('Chyba', 'Operácia zlyhala.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color="#1a1a2e" /></View>;
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>Žiadne čakajúce registrácie.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.date}>Registrovaný: {new Date(item.createdAt).toLocaleDateString('sk-SK')}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.approveBtn} onPress={() => void handleAction(item, 'approve')}>
              <Text style={styles.approveTxt}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => void handleAction(item, 'reject')}>
              <Text style={styles.rejectTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  empty: { color: '#999', fontSize: 15, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  email: { fontSize: 13, color: '#555', marginBottom: 2 },
  date: { fontSize: 11, color: '#999' },
  actions: { flexDirection: 'row', gap: 8 },
  approveBtn: { backgroundColor: '#059669', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  approveTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  rejectBtn: { backgroundColor: '#dc2626', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rejectTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
