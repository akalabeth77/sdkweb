import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import type { EventItem } from '@/lib/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://sdkweb.vercel.app';

const CATEGORY_COLOR: Record<string, string> = {
  course: '#2563eb',
  'dance-party': '#db2777',
  workshop: '#7c3aed',
  festival: '#ea580c',
  concert: '#059669',
  other: '#6b7280',
};

const CATEGORY_LABEL: Record<string, string> = {
  course: 'Kurz',
  'dance-party': 'Tančiareň',
  workshop: 'Workshop',
  festival: 'Festival',
  concert: 'Koncert',
  other: 'Iné',
};

export default function EventsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.events.list(),
  });

  if (isLoading) {
    return <View style={styles.center}><Text style={styles.stateText}>Načítavam eventy…</Text></View>;
  }

  if (isError) {
    return <View style={styles.center}><Text style={styles.stateText}>Chyba pri načítaní eventov.</Text></View>;
  }

  const events = data?.events ?? [];

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
      ListEmptyComponent={<Text style={styles.empty}>Žiadne nadchádzajúce eventy.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => void WebBrowser.openBrowserAsync(`${BASE_URL}/events/${encodeURIComponent(item.id)}`)}>
          <EventCard event={item} />
        </TouchableOpacity>
      )}
    />
  );
}

function EventCard({ event }: { event: EventItem }) {
  const cat = event.category ?? 'other';
  const color = CATEGORY_COLOR[cat] ?? '#6b7280';
  const label = CATEGORY_LABEL[cat] ?? 'Iné';
  const d = new Date(event.start);
  const dateStr = d.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDate}>📅 {dateStr}</Text>
      <Text style={styles.cardDate}>⏰ {timeStr}</Text>
      {event.location ? <Text style={styles.cardMeta}>📍 {event.location}</Text> : null}
      {event.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{event.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  stateText: { fontSize: 15, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  cardDate: { fontSize: 13, color: '#444', marginBottom: 2 },
  cardMeta: { fontSize: 13, color: '#555', marginTop: 4 },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 8, lineHeight: 19 },
});
