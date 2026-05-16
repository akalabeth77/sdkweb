import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EventItem } from '@/lib/types';

const CATEGORY_COLOR: Record<string, string> = {
  course: '#2563eb', 'dance-party': '#db2777', workshop: '#7c3aed',
  festival: '#ea580c', concert: '#059669', other: '#6b7280',
};
const CATEGORY_LABEL: Record<string, string> = {
  course: 'Kurz', 'dance-party': 'Tančiareň', workshop: 'Workshop',
  festival: 'Festival', concert: 'Koncert', other: 'Iné',
};

export default function AdminEventsScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.admin.events.list(),
  });

  const events = [...(data?.events ?? [])].sort((a, b) => b.start.localeCompare(a.start));

  if (isLoading) {
    return <View style={styles.center}><Text>Načítavam eventy…</Text></View>;
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
        ListEmptyComponent={<Text style={styles.empty}>Žiadne eventy.</Text>}
        renderItem={({ item }) => <EventRow event={item} />}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/admin/create-event')}>
        <Text style={styles.fabText}>+ Nový event</Text>
      </TouchableOpacity>
    </View>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const cat = event.category ?? 'other';
  const color = CATEGORY_COLOR[cat] ?? '#6b7280';
  const label = CATEGORY_LABEL[cat] ?? 'Iné';
  const d = new Date(event.start.replace(/Z$/, ''));
  const isPast = d < new Date();

  return (
    <View style={[styles.card, isPast && styles.pastCard]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <Text style={[styles.title, isPast && styles.pastText]}>{event.title}</Text>
      <Text style={styles.date}>
        {d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}
        {' · '}
        {d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {event.location ? <Text style={styles.location}>📍 {event.location}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f8f8' },
  list: { padding: 16, paddingBottom: 80, gap: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  pastCard: { opacity: 0.55 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  pastText: { color: '#666' },
  date: { fontSize: 13, color: '#555' },
  location: { fontSize: 12, color: '#777', marginTop: 3 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1a1a2e', borderRadius: 30, paddingHorizontal: 20, paddingVertical: 14, elevation: 4 },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
