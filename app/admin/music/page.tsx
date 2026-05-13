'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { SpotifyPlaylistRecord } from '@/lib/store';

export default function AdminMusicPage() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylistRecord[]>([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', spotifyUrl: '', description: '', isActive: true });

  async function load() {
    const r = await fetch('/api/admin/spotify', { cache: 'no-store' });
    if (r.ok) setPlaylists(await r.json());
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch('/api/admin/spotify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: fd.get('title'), spotifyUrl: fd.get('spotifyUrl'), description: fd.get('description'), isActive: true }),
    });
    setMessage(r.ok ? 'Playlist pridaný.' : 'Chyba pri pridávaní.');
    if (r.ok) { (e.target as HTMLFormElement).reset(); await load(); }
  }

  async function handleUpdate() {
    if (!editId) return;
    const r = await fetch(`/api/admin/spotify/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    setMessage(r.ok ? 'Playlist upravený.' : 'Chyba pri úprave.');
    if (r.ok) { setEditId(null); await load(); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Vymazať playlist?')) return;
    const r = await fetch(`/api/admin/spotify/${id}`, { method: 'DELETE' });
    setMessage(r.ok ? 'Playlist vymazaný.' : 'Chyba pri mazaní.');
    if (r.ok) await load();
  }

  return (
    <section className="card">
      <h1>🎵 Správa playlistov</h1>
      <form onSubmit={(e) => void handleCreate(e)}>
        <label>Názov *<input name="title" required /></label>
        <label>Spotify URL *<input name="spotifyUrl" required placeholder="https://open.spotify.com/playlist/..." /></label>
        <label>Popis<textarea name="description" rows={2} /></label>
        <button type="submit">Pridať playlist</button>
      </form>
      {message ? <p className="small">{message}</p> : null}
      <h2 style={{ marginTop: '1.5rem' }}>Existujúce playlisty</h2>
      <div className="grid" style={{ gap: '1rem' }}>
        {playlists.map((p) => (
          <div key={p.id} className="card">
            {editId === p.id ? (
              <>
                <label>Názov<input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} /></label>
                <label>URL<input value={editData.spotifyUrl} onChange={(e) => setEditData({ ...editData, spotifyUrl: e.target.value })} /></label>
                <label>Popis<textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} /></label>
                <label><input type="checkbox" checked={editData.isActive} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} /> Aktívny</label>
                <button onClick={() => void handleUpdate()}>Uložiť</button>
                <button type="button" onClick={() => setEditId(null)} style={{ marginLeft: '0.5rem', background: '#666' }}>Zrušiť</button>
              </>
            ) : (
              <>
                <strong>{p.title}</strong>
                <div className="small" style={{ wordBreak: 'break-all' }}>{p.spotifyUrl}</div>
                {p.description ? <p className="small">{p.description}</p> : null}
                <div className="small">{p.isActive ? '✅ Aktívny' : '⏸ Neaktívny'}</div>
                <button type="button" onClick={() => { setEditId(p.id); setEditData({ title: p.title, spotifyUrl: p.spotifyUrl, description: p.description ?? '', isActive: p.isActive }); }}>Upraviť</button>
                <button type="button" onClick={() => void handleDelete(p.id)} style={{ marginLeft: '0.5rem', background: '#b91c1c' }}>Vymazať</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
