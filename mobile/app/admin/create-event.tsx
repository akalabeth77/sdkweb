import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type Category = 'course' | 'dance-party' | 'workshop' | 'festival' | 'concert' | 'other';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'course', label: 'Kurz' },
  { value: 'dance-party', label: 'Tančiareň' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'festival', label: 'Festival' },
  { value: 'concert', label: 'Koncert' },
  { value: 'other', label: 'Iné' },
];

function toIso(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const d = new Date(trimmed.replace(' ', 'T'));
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function CreateEventScreen() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Chyba', 'Zadaj názov eventu.'); return; }
    const startIso = toIso(start);
    if (!startIso) { Alert.alert('Chyba', 'Zadaj platný dátum začiatku.\nFormát: 2026-05-20 18:00'); return; }

    setLoading(true);
    try {
      await api.admin.events.create({
        title: title.trim(),
        category,
        start: startIso,
        end: toIso(end),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      await qc.invalidateQueries({ queryKey: ['admin-events'] });
      await qc.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Hotovo', 'Event bol vytvorený a notifikácia odoslaná.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Chyba', error instanceof Error ? error.message : 'Nepodarilo sa vytvoriť event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Názov *</Text>
      <TextInput style={styles.input} placeholder="Názov eventu" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Kategória</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.catBtn, category === cat.value && styles.catBtnActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.catText, category === cat.value && styles.catTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Začiatok * (formát: 2026-05-20 18:00)</Text>
      <TextInput style={styles.input} placeholder="2026-05-20 18:00" value={start} onChangeText={setStart} autoCapitalize="none" />

      <Text style={styles.label}>Koniec (voliteľné)</Text>
      <TextInput style={styles.input} placeholder="2026-05-20 20:00" value={end} onChangeText={setEnd} autoCapitalize="none" />

      <Text style={styles.label}>Miesto</Text>
      <TextInput style={styles.input} placeholder="Názov miesta" value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Popis</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Popis eventu…"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Vytvoriť event</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 13, fontSize: 15, backgroundColor: '#fafafa', color: '#1a1a2e' },
  textarea: { height: 100, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fafafa' },
  catBtnActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  catText: { fontSize: 13, color: '#555' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
