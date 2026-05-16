'use client';

import { useEffect, useState } from 'react';
import { GalleryAlbum, GalleryAlbumSource, MediaItem } from '@/types';

type AlbumForm = { title: string; sourceType: GalleryAlbumSource; sourceRef: string; isActive: boolean; visibility: 'public' | 'members' };
type MediaForm = { imageUrl: string; caption: string; visibility: 'public' | 'members' };

const SOURCE_TYPES: { value: GalleryAlbumSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'instagram-embed', label: 'Instagram Embed' },
  { value: 'google-photos', label: 'Google Photos' },
  { value: 'google-drive', label: 'Google Drive' },
  { value: 'local-folder', label: 'Local folder' },
];

const SOURCE_HINTS: Record<GalleryAlbumSource, string> = {
  instagram: 'Instagram Business account ID. Vyžaduje IG_ACCESS_TOKEN.',
  'instagram-embed': 'URL Instagram postov (jeden na riadok).',
  'google-photos': 'URL zdieľaného Google Photos albumu.',
  'google-drive': 'Verejný Google Drive folder URL alebo ID.',
  'local-folder': 'Relatívna cesta pod LOCAL_GALLERY_ROOT.',
};

const EMPTY_ALBUM: AlbumForm = { title: '', sourceType: 'google-photos', sourceRef: '', isActive: true, visibility: 'public' };
const EMPTY_MEDIA: MediaForm = { imageUrl: '', caption: '', visibility: 'public' };

function Overlay({ onBg, children }: { onBg: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onBg(); }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
  background: active ? '#1a1a2e' : '#f0f0f0', color: active ? '#fff' : '#555',
});

export default function AdminGalleryPage() {
  const [tab, setTab] = useState<'albums' | 'media'>('albums');
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visFilter, setVisFilter] = useState('all');
  const [editAlbum, setEditAlbum] = useState<GalleryAlbum | null>(null);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [createAlbum, setCreateAlbum] = useState(false);
  const [createMedia, setCreateMedia] = useState(false);
  const [albumForm, setAlbumForm] = useState<AlbumForm>(EMPTY_ALBUM);
  const [mediaForm, setMediaForm] = useState<MediaForm>(EMPTY_MEDIA);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [a, m] = await Promise.all([
      fetch('/api/admin/gallery-albums', { cache: 'no-store' }).then(r => r.ok ? r.json() as Promise<GalleryAlbum[]> : []),
      fetch('/api/admin/media', { cache: 'no-store' }).then(r => r.ok ? r.json() as Promise<MediaItem[]> : []),
    ]);
    setAlbums(a); setMedia(m); setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const filteredAlbums = albums.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.title.toLowerCase().includes(q) || a.sourceRef.toLowerCase().includes(q))
      && (visFilter === 'all' || a.visibility === visFilter);
  });

  const filteredMedia = media.filter(m => {
    const q = search.toLowerCase();
    return (!q || (m.caption ?? '').toLowerCase().includes(q) || m.imageUrl.toLowerCase().includes(q))
      && (visFilter === 'all' || m.visibility === visFilter);
  });

  async function saveAlbum() {
    if (!albumForm.title.trim() || !albumForm.sourceRef.trim()) return;
    setSaving(true);
    const url = editAlbum ? `/api/admin/gallery-albums/${editAlbum.id}` : '/api/admin/gallery-albums';
    const res = await fetch(url, { method: editAlbum ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(albumForm) });
    if (res.ok) { setMsg('✅ Uložené.'); setEditAlbum(null); setCreateAlbum(false); await load(); }
    else setMsg('❌ Chyba.');
    setSaving(false);
  }

  async function deleteAlbum() {
    if (!editAlbum || !confirm(`Zmazať album "${editAlbum.title}"?`)) return;
    await fetch(`/api/admin/gallery-albums/${editAlbum.id}`, { method: 'DELETE' });
    setMsg('Zmazané.'); setEditAlbum(null); await load();
  }

  async function saveMedia() {
    if (!mediaForm.imageUrl.trim()) return;
    setSaving(true);
    const url = editMedia ? `/api/admin/media/${editMedia.id}` : '/api/admin/media';
    const res = await fetch(url, { method: editMedia ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mediaForm) });
    if (res.ok) { setMsg('✅ Uložené.'); setEditMedia(null); setCreateMedia(false); await load(); }
    else setMsg('❌ Chyba.');
    setSaving(false);
  }

  async function deleteMedia() {
    if (!editMedia || !confirm('Zmazať tento obrázok?')) return;
    await fetch(`/api/admin/media/${editMedia.id}`, { method: 'DELETE' });
    setMsg('Zmazané.'); setEditMedia(null); await load();
  }

  const switchTab = (t: 'albums' | 'media') => { setTab(t); setSearch(''); setVisFilter('all'); };

  return (
    <section className="card">
      <h1>Galéria</h1>
      {msg && <p className="small">{msg}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button type="button" style={tabStyle(tab === 'albums')} onClick={() => switchTab('albums')}>🖼 Albumy ({albums.length})</button>
        <button type="button" style={tabStyle(tab === 'media')} onClick={() => switchTab('media')}>📷 Fotky ({media.length})</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder={tab === 'albums' ? 'Hľadaj albumy…' : 'Hľadaj fotky…'} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 200px', margin: 0 }} />
        <select value={visFilter} onChange={e => setVisFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="all">Všetky</option>
          <option value="public">Verejné</option>
          <option value="members">Len pre členov</option>
        </select>
        {tab === 'albums'
          ? <button type="button" onClick={() => { setAlbumForm(EMPTY_ALBUM); setCreateAlbum(true); }}>+ Nový album</button>
          : <button type="button" onClick={() => { setMediaForm(EMPTY_MEDIA); setCreateMedia(true); }}>+ Nová fotka</button>}
      </div>

      {loading ? <p className="small">Načítavam…</p> : tab === 'albums' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead><tr style={{ borderBottom: '2px solid #e8e8e8', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>Názov</th><th style={{ padding: '8px 10px' }}>Typ</th>
              <th style={{ padding: '8px 10px' }}>Aktívny</th><th style={{ padding: '8px 10px' }}>Viditeľnosť</th>
              <th style={{ padding: '8px 10px' }}></th>
            </tr></thead>
            <tbody>
              {filteredAlbums.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{a.title}</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.8rem', color: '#555' }}>{a.sourceType}</td>
                  <td style={{ padding: '8px 10px' }}>{a.isActive ? '✓' : '–'}</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{a.visibility === 'members' ? '🔒' : '🌐'}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={() => { setEditAlbum(a); setAlbumForm({ title: a.title, sourceType: a.sourceType, sourceRef: a.sourceRef, isActive: a.isActive, visibility: (a.visibility ?? 'public') as 'public' | 'members' }); }}>
                      ✏️ Upraviť
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead><tr style={{ borderBottom: '2px solid #e8e8e8', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>Náhľad</th><th style={{ padding: '8px 10px' }}>Popis</th>
              <th style={{ padding: '8px 10px' }}>Viditeľnosť</th><th style={{ padding: '8px 10px' }}></th>
            </tr></thead>
            <tbody>
              {filteredMedia.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px' }}>
                    {m.imageUrl && <img src={m.imageUrl} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#555' }}>{m.caption || '–'}</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{m.visibility === 'members' ? '🔒' : '🌐'}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={() => { setEditMedia(m); setMediaForm({ imageUrl: m.imageUrl, caption: m.caption ?? '', visibility: (m.visibility ?? 'public') as 'public' | 'members' }); }}>
                      ✏️ Upraviť
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editAlbum || createAlbum) && (
        <Overlay onBg={() => { setEditAlbum(null); setCreateAlbum(false); }}>
          <h2 style={{ margin: '0 0 1rem' }}>{editAlbum ? `Upraviť: ${editAlbum.title}` : 'Nový album'}</h2>
          <label>Názov<input value={albumForm.title} onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })} /></label>
          <label>Typ zdroja
            <select value={albumForm.sourceType} onChange={e => setAlbumForm({ ...albumForm, sourceType: e.target.value as GalleryAlbumSource })}>
              {SOURCE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>Odkaz / Ref
            {albumForm.sourceType === 'instagram-embed'
              ? <textarea value={albumForm.sourceRef} onChange={e => setAlbumForm({ ...albumForm, sourceRef: e.target.value })} rows={5} style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85em' }} />
              : <input value={albumForm.sourceRef} onChange={e => setAlbumForm({ ...albumForm, sourceRef: e.target.value })} />}
          </label>
          <p className="small" style={{ color: '#777', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>{SOURCE_HINTS[albumForm.sourceType]}</p>
          <label>Viditeľnosť
            <select value={albumForm.visibility} onChange={e => setAlbumForm({ ...albumForm, visibility: e.target.value as 'public' | 'members' })}>
              <option value="public">🌐 Verejný</option><option value="members">🔒 Len pre členov</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="checkbox" checked={albumForm.isActive} onChange={e => setAlbumForm({ ...albumForm, isActive: e.target.checked })} /> Aktívny
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={saveAlbum} disabled={saving}>{saving ? 'Ukladám…' : '✅ Uložiť'}</button>
            <button type="button" style={{ background: '#f0f0f0', color: '#333' }} onClick={() => { setEditAlbum(null); setCreateAlbum(false); }}>Zatvoriť</button>
            {editAlbum && <button type="button" style={{ background: '#dc2626', color: '#fff', marginLeft: 'auto' }} onClick={deleteAlbum}>🗑 Zmazať</button>}
          </div>
        </Overlay>
      )}

      {(editMedia || createMedia) && (
        <Overlay onBg={() => { setEditMedia(null); setCreateMedia(false); }}>
          <h2 style={{ margin: '0 0 1rem' }}>{editMedia ? 'Upraviť fotku' : 'Nová fotka'}</h2>
          <label>URL obrázka<input type="url" value={mediaForm.imageUrl} onChange={e => setMediaForm({ ...mediaForm, imageUrl: e.target.value })} /></label>
          <label>Popis (caption)<input value={mediaForm.caption} onChange={e => setMediaForm({ ...mediaForm, caption: e.target.value })} /></label>
          <label>Viditeľnosť
            <select value={mediaForm.visibility} onChange={e => setMediaForm({ ...mediaForm, visibility: e.target.value as 'public' | 'members' })}>
              <option value="public">🌐 Verejná</option><option value="members">🔒 Len pre členov</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button type="button" onClick={saveMedia} disabled={saving}>{saving ? 'Ukladám…' : '✅ Uložiť'}</button>
            <button type="button" style={{ background: '#f0f0f0', color: '#333' }} onClick={() => { setEditMedia(null); setCreateMedia(false); }}>Zatvoriť</button>
            {editMedia && <button type="button" style={{ background: '#dc2626', color: '#fff', marginLeft: 'auto' }} onClick={deleteMedia}>🗑 Zmazať</button>}
          </div>
        </Overlay>
      )}
    </section>
  );
}
