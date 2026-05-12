import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, ScrollView, Share, Alert,
} from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { EventItem } from '@/lib/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://sdkweb.vercel.app';

function buildGCalUrl(event: EventItem): string {
  function toGCal(iso: string) {
    return iso.replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGCal(event.start)}/${toGCal(event.end ?? event.start)}`,
    ...(event.location ? { location: event.location } : {}),
    ...(event.description ? { details: event.description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const CATEGORY_COLOR: Record<string, string> = {
  course: '#2563eb', 'dance-party': '#db2777', workshop: '#7c3aed',
  festival: '#ea580c', concert: '#059669', other: '#6b7280',
};

const CATEGORY_LABEL: Record<string, string> = {
  course: 'Kurz', 'dance-party': 'Tančiareň', workshop: 'Workshop',
  festival: 'Festival', concert: 'Koncert', other: 'Iné',
};

const FILTERS = [
  { key: 'all', label: 'Všetky' },
  { key: 'course', label: 'Kurzy' },
  { key: 'dance-party', label: 'Tančiarne' },
  { key: 'workshop', label: 'Workshopy' },
  { key: 'festival', label: 'Festivaly' },
  { key: 'concert', label: 'Koncerty' },
  { key: 'other', label: 'Iné' },
];

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();
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

  const allEvents = data?.events ?? [];
  const events = activeFilter === 'all'
    ? allEvents
    : allEvents.filter((e) => (e.category ?? 'other') === activeFilter);

  return (
    <View style={styles.flex}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
        ListEmptyComponent={<Text style={styles.empty}>Žiadne eventy v tejto kategórii.</Text>}
        renderItem={({ item }) => (
          <EventCard event={item} isLoggedIn={!!user} isInternal={item.source === 'internal'} />
        )}
      />
    </View>
  );
}

function EventCard({
  event,
  isLoggedIn,
  isInternal,
}: {
  event: EventItem;
  isLoggedIn: boolean;
  isInternal: boolean;
}) {
  const qc = useQueryClient();
  const cat = event.category ?? 'other';
  const color = CATEGORY_COLOR[cat] ?? '#6b7280';
  const label = CATEGORY_LABEL[cat] ?? 'Iné';
  const d = new Date(event.start);
  const dateStr = d.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
  const eventUrl = `${BASE_URL}/events/${encodeURIComponent(event.id)}`;

  const { mutate: register, isPending: registering } = useMutation({
    mutationFn: () => api.events.register(event.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Registrácia potvrdená', `Si prihlásený na event:\n${event.title}`);
    },
    onError: (err) => {
      Alert.alert('Chyba', err instanceof Error ? err.message : 'Registrácia zlyhala.');
    },
  });

  function handleShare() {
    void Share.share({
      title: event.title,
      message: `${event.title}\n📅 ${dateStr} · ⏰ ${timeStr}\n${eventUrl}`,
      url: eventUrl,
    });
  }

  return (
    <TouchableOpacity
      onPress={() => void WebBrowser.openBrowserAsync(eventUrl)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{label}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.shareIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.cardDate}>📅 {dateStr}</Text>
        <Text style={styles.cardDate}>⏰ {timeStr}</Text>
        {event.location ? <Text style={styles.cardMeta}>📍 {event.location}</Text> : null}
        {event.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{event.description}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.calBtn}
          onPress={() => void WebBrowser.openBrowserAsync(buildGCalUrl(event))}
        >
          <Text style={styles.calBtnText}>📅 Pridať do kalendára</Text>
        </TouchableOpacity>

        {isLoggedIn && isInternal ? (
          <TouchableOpacity
            style={[styles.registerBtn, registering && styles.registerBtnDisabled]}
            onPress={() => register()}
            disabled={registering}
          >
            <Text style={styles.registerBtnText}>
              {registering ? 'Prihlasujem…' : '✓ Prihlásiť sa'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f8f8' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e8e8f0', borderWidth: 1, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  filterText: { fontSize: 13, color: '#555', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 4, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  stateText: { fontSize: 15, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  shareIcon: { fontSize: 22, color: '#999', fontWeight: '700' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  cardDate: { fontSize: 13, color: '#444', marginBottom: 2 },
  cardMeta: { fontSize: 13, color: '#555', marginTop: 4 },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 8, lineHeight: 19 },
  calBtn: { marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  calBtnText: { fontSize: 13, color: '#555' },
  registerBtn: { marginTop: 8, backgroundColor: '#1a1a2e', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  registerBtnDisabled: { opacity: 0.5 },
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
