import { View, Text, ScrollView, StyleSheet, useWindowDimensions, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import RenderHtml from 'react-native-render-html';
import { api } from '@/lib/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://sdkweb.vercel.app';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles'],
    queryFn: () => api.articles.list(),
    staleTime: 1000 * 60 * 5,
  });

  const article = data?.articles.find((a) => a.id === id || a.slug === id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1a1a2e" size="large" />
      </View>
    );
  }

  if (isError || !article) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Článok sa nenašiel.</Text>
      </View>
    );
  }

  const articleUrl = `${BASE_URL}/articles/${article.slug ?? article.id}`;
  const date = new Date(article.publishedAt ?? article.createdAt)
    .toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

  function handleShare() {
    void Share.share({ title: article!.title, message: `${article!.title}\n${articleUrl}`, url: articleUrl });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: article.title.length > 30 ? `${article.title.slice(0, 30)}…` : article.title,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 4 }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>↗</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>{article.author} · {date}</Text>
        <View style={styles.divider} />
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: article.content }}
          tagsStyles={{
            p: { fontSize: 16, lineHeight: 26, color: '#222', marginBottom: 12 },
            h1: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
            h2: { fontSize: 19, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
            h3: { fontSize: 17, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
            a: { color: '#2563eb' },
            li: { fontSize: 16, lineHeight: 24, color: '#222' },
            blockquote: { borderLeftWidth: 3, borderLeftColor: '#ddd', paddingLeft: 12, color: '#555' },
          }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15, color: '#666' },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', lineHeight: 32, marginBottom: 8 },
  meta: { fontSize: 13, color: '#888', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
});
