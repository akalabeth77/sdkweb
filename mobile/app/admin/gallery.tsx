import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, TextInput, Switch, Modal, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type GalleryAlbum, type GalleryAlbumInput } from '@/lib/api';

const SOURCE_TYPES = ['google-photos', 'google-drive', 'instagram', 'instagram-embed', 'local-folder'];

const EMPTY_FORM: GalleryAlbumInput = {
  title: '',
  sourceType: 'google-photos',
  sourceRef: '',
  isActive: true,
  visibility: 'public',
};

export default function AdminGalleryScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin-gallery-albums'],
    queryFn: () => api.admin.galleryAlbums.list(),
  });

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editAlbum, setEditAlbum] = useState<GalleryAlbum | null>(null);
  const [form, setForm] = useState<GalleryAlbumInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const albums = (data?.albums ?? []).filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.sourceRef.toLowerCase().includes(q);
  });

  function openCreate() {
    setEditAlbum(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(album: GalleryAlbum) {
    setEditAlbum(album);
    setForm({
      title: album.title,
      sourceType: album.sourceType,
      sourceRef: album.sourceRef,
      isActive: album.isActive,
      visibility: album.visibility as 'public' | 'members',
    });
    setModalVisible(true);
  }

  async function save() {
    if (!form.title.trim() || !form.sourceRef.trim()) {
      Alert.alert('Chyba', 'Vyplň názov a odkaz.');
      return;
    }
    setSaving(true);
    try {
      if (editAlbum) {
        await api.admin.galleryAlbums.update(editAlbum.id, form);
      } else {
        await api.admin.galleryAlbums.create(form);
      }
      await qc.invalidateQueries({ queryKey: ['admin-gallery-albums'] });
      setModalVisible(false);
    } catch {
      Alert.alert('Chyba', 'Ukladanie zlyhalo.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editAlbum) return;
    Alert.alert('Zmazať album', `Naozaj zmazať "${editAlbum.title}"?`, [
      { text: 'Zrušiť', style: 'cancel' },
      {
        text: 'Zmazať', style: 'destructive',
        onPress: async () => {
          try {
            await api.admin.galleryAlbums.remove(editAlbum.id);
            await qc.invalidateQueries({ queryKey: ['admin-gallery-albums'] });
            setModalVisible(false);
          } catch {
            Alert.alert('Chyba', 'Mazanie zlyhalo.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return <View style={s.center}><Text>Načítavam albumy…</Text></View>;
  }

  return (
    <View style={s.flex}>
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Hľadaj podľa názvu alebo odkazu…"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a1a2e" />}
        ListEmptyComponent={<Text style={s.empty}>Žiadne albumy.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => openEdit(item)}>
            <View style={s.cardRow}>
              <View style={[s.badge, { backgroundColor: item.isActive ? '#059669' : '#9ca3af' }]}>
                <Text style={s.badgeText}>{item.isActive ? 'Aktívny' : 'Neaktívny'}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: '#2563eb' }]}>
                <Text style={s.badgeText}>{item.sourceType}</Text>
              </View>
              {item.visibility === 'members' && (
                <View style={[s.badge, { backgroundColor: '#7c3aed' }]}>
                  <Text style={s.badgeText}>Členovia</Text>
                </View>
              )}
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.ref} numberOfLines={1}>{item.sourceRef}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={s.fab} onPress={openCreate}>
        <Text style={s.fabText}>+ Nový album</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <ScrollView contentContainerStyle={s.modal}>
          <Text style={s.modalTitle}>{editAlbum ? 'Upraviť album' : 'Nový album'}</Text>

          <Text style={s.label}>Názov</Text>
          <TextInput style={s.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Napr. Ples 2026" />

          <Text style={s.label}>Typ zdroja</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {SOURCE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.chip, form.sourceType === t && s.chipActive]}
                onPress={() => setForm({ ...form, sourceType: t })}
              >
                <Text style={[s.chipText, form.sourceType === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.label}>Odkaz / ID</Text>
          <TextInput style={s.input} value={form.sourceRef} onChangeText={(v) => setForm({ ...form, sourceRef: v })} placeholder="https://photos.google.com/..." autoCapitalize="none" />

          <View style={s.switchRow}>
            <Text style={s.label}>Aktívny</Text>
            <Switch value={form.isActive} onValueChange={(v) => setForm({ ...form, isActive: v })} trackColor={{ true: '#1a1a2e' }} />
          </View>

          <View style={s.switchRow}>
            <Text style={s.label}>Len pre členov</Text>
            <Switch
              value={form.visibility === 'members'}
              onValueChange={(v) => setForm({ ...form, visibility: v ? 'members' : 'public' })}
              trackColor={{ true: '#7c3aed' }}
            />
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? 'Ukladám…' : '✅ Uložiť'}</Text>
          </TouchableOpacity>

          {editAlbum && (
            <TouchableOpacity style={s.deleteBtn} onPress={remove}>
              <Text style={s.deleteBtnText}>🗑 Zmazať album</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={s.cancelBtnText}>Zatvoriť</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { padding: 12, paddingBottom: 4 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, color: '#1a1a2e' },
  list: { padding: 12, paddingBottom: 80, gap: 10 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  ref: { fontSize: 12, color: '#777' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1a1a2e', borderRadius: 30, paddingHorizontal: 20, paddingVertical: 14, elevation: 4 },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modal: { padding: 24, paddingBottom: 48 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a2e', backgroundColor: '#fafafa', marginBottom: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#e8e8f0', borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8 },
  chipActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  chipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  deleteBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 10 },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 15 },
});
