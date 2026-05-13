import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Article } from '@/lib/types';

export default function ArticlesScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['articles'],
    queryFn: () => api.articles.list(),
  });

  if (isLoading) {
    return <View style={styles.center}><Text style={styles.stateText}>Načítavam články…</Text></View>;
  }

  if (isError) {
    return <View style={styles.center}><Text style={styles.stateText}>Chyba pri načítaní článkov.</Text></View>;
  }

  const articles = data?.articles ?? [];

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
      ListEmptyComponent={<Text style={styles.empty}>Žiadne publikované články.</Text>}
      renderItem={({ item }) => {
        const isLocked = (item as any).visibility === 'members' && !user;
        return (
          <TouchableOpacity
            onPress={() => {
              if (isLocked) {
                Alert.alert('Len pre členov', 'Tento článok je dostupný len pre prihlásených používateľov.');
                return;
              }
              router.push(`/article/${item.id}` as never);
            }}
          >
            <ArticleCard article={item} isLocked={isLocked} />
          </TouchableOpacity>
        );
      }}
    />
  );
}

function ArticleCard({ article, isLocked }: { article: Article; isLocked: boolean }) {
  const date = new Date(article.publishedAt ?? article.createdAt);
  const dateStr = date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={[styles.card, isLocked && { opacity: 0.7 }]}>
      <Text style={styles.cardTitle}>{isLocked ? '🔒 ' : ''}{article.title}</Text>
      <Text style={styles.cardMeta}>{article.author} · {dateStr}</Text>
      {isLocked ? (
        <Text style={[styles.excerpt, { color: '#999', fontStyle: 'italic' }]}>Len pre prihlásených členov</Text>
      ) : article.excerpt ? (
        <Text style={styles.excerpt} numberOfLines={3}>{article.excerpt}</Text>
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
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  cardMeta: { fontSize: 12, color: '#888', marginBottom: 10 },
  excerpt: { fontSize: 14, color: '#444', lineHeight: 21 },
});
