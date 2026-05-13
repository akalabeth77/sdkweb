import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/lib/api';
import type { SpotifyPlaylist } from '@/lib/types';

export default function MusicScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['music'],
    queryFn: () => api.music.list(),
  });

  if (isLoading) {
    return <View style={styles.center}><Text style={styles.stateText}>Načítavam playlisty…</Text></View>;
  }

  if (isError) {
    return <View style={styles.center}><Text style={styles.stateText}>Chyba pri načítaní.</Text></View>;
  }

  const playlists = data?.playlists ?? [];

  return (
    <FlatList
      data={playlists}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
      ListEmptyComponent={<Text style={styles.empty}>Žiadne playlisty.</Text>}
      renderItem={({ item }) => <PlaylistCard playlist={item} />}
    />
  );
}

function PlaylistCard({ playlist }: { playlist: SpotifyPlaylist }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{playlist.title}</Text>
      {playlist.description ? <Text style={styles.desc}>{playlist.description}</Text> : null}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => void WebBrowser.openBrowserAsync(playlist.spotifyUrl)}
      >
        <Text style={styles.btnText}>▶ Otvoriť v Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  stateText: { fontSize: 15, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  desc: { fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 19 },
  btn: { backgroundColor: '#1DB954', borderRadius: 24, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
