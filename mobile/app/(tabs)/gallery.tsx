import { View, Text, FlatList, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MediaItem } from '@/lib/types';

const NUM_COLS = 2;
const GAP = 8;
const SCREEN_W = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_W - 32 - GAP) / NUM_COLS;

export default function GalleryScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.gallery.list(),
  });

  if (isLoading) {
    return <View style={styles.center}><Text style={styles.stateText}>Načítavam galériu…</Text></View>;
  }

  if (isError) {
    return <View style={styles.center}><Text style={styles.stateText}>Chyba pri načítaní galérie.</Text></View>;
  }

  const media = data?.media ?? [];

  return (
    <FlatList
      data={media}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
      ListEmptyComponent={<Text style={styles.empty}>Galéria je prázdna.</Text>}
      renderItem={({ item }) => <GalleryItem item={item} />}
    />
  );
}

function GalleryItem({ item }: { item: MediaItem }) {
  return (
    <View style={styles.item}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        recyclingKey={item.id}
      />
      {item.caption ? (
        <Text style={styles.caption} numberOfLines={1}>{item.caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  row: { gap: GAP, marginBottom: GAP },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  stateText: { fontSize: 15, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 15 },
  item: { width: ITEM_SIZE },
  image: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 10 },
  caption: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
});
