'use client';

import { useCallback, useEffect, useState } from 'react';
import { Article } from '@/types';
import { useLanguage } from '@/components/language-context';
import { toDateLocale } from '@/lib/i18n';
import { RichTextEditor } from '@/components/rich-text-editor';

type ArticleForm = { title: string; content: string; status: 'draft' | 'published'; visibility: 'public' | 'members' };

const EMPTY: ArticleForm = { title: '', content: '<p></p>', status: 'draft', visibility: 'public' };

function initialEditorValue(value: string): string {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value;
  return `<p>${value.replace(/\n/g, '<br>')}</p>`;
}

function Overlay({ onBg, children }: { onBg: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onBg(); }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visFilter, setVisFilter] = useState('all');
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ArticleForm>(EMPTY);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const { locale } = useLanguage();

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/articles', { cache: 'no-store' });
    if (res.ok) setArticles(await res.json() as Article[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.title.toLowerCase().includes(q))
      && (statusFilter === 'all' || a.status === statusFilter)
      && (visFilter === 'all' || a.visibility === visFilter);
  });

  function openEdit(a: Article) {
    setEditArticle(a);
    setForm({ title: a.title, content: initialEditorValue(a.content), status: a.status, visibility: (a.visibility ?? 'public') as 'public' | 'members' });
  }

  function closeModal() { setEditArticle(null); setCreateOpen(false); }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const url = editArticle ? `/api/admin/articles/${editArticle.id}` : '/api/admin/articles';
    const res = await fetch(url, { method: editArticle ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setMsg('✅ Uložené.'); closeModal(); await load(); }
    else setMsg('❌ Chyba.');
    setSaving(false);
  }

  async function del() {
    if (!editArticle || !confirm(`Zmazať článok "${editArticle.title}"?`)) return;
    await fetch(`/api/admin/articles/${editArticle.id}`, { method: 'DELETE' });
    setMsg('Zmazané.'); closeModal(); await load();
  }

  const isOpen = editArticle || createOpen;

  return (
    <section className="card">
      <h1>Články</h1>
      {msg && <p className="small">{msg}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Hľadaj podľa nadpisu…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 200px', margin: 0 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="all">Všetky stavy</option>
          <option value="draft">Návrh</option>
          <option value="published">Publikovaný</option>
        </select>
        <select value={visFilter} onChange={e => setVisFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="all">Všetky</option>
          <option value="public">Verejné</option>
          <option value="members">Len pre členov</option>
        </select>
        <button type="button" onClick={() => { setForm(EMPTY); setCreateOpen(true); }}>+ Nový článok</button>
      </div>

      {loading ? <p className="small">Načítavam…</p> : filtered.length === 0 ? <p className="small">Žiadne články.</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead><tr style={{ borderBottom: '2px solid #e8e8e8', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Nadpis</th>
              <th style={{ padding: '8px 12px' }}>Stav</th>
              <th style={{ padding: '8px 12px' }}>Viditeľnosť</th>
              <th style={{ padding: '8px 12px' }}>Vytvorený</th>
              <th style={{ padding: '8px 12px' }}></th>
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{a.title}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ background: a.status === 'published' ? '#dcfce7' : '#fef9c3', color: a.status === 'published' ? '#166534' : '#854d0e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {a.status === 'published' ? 'Publikovaný' : 'Návrh'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{a.visibility === 'members' ? '🔒' : '🌐'}</td>
                  <td style={{ padding: '8px 12px', color: '#888', fontSize: '0.8rem' }}>
                    {new Date(a.createdAt).toLocaleDateString(toDateLocale(locale))}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => openEdit(a)}>✏️ Upraviť</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <Overlay onBg={closeModal}>
          {/* key resets RichTextEditor state on each open */}
          <div key={editArticle?.id ?? 'new'}>
            <h2 style={{ margin: '0 0 1rem' }}>{editArticle ? `Upraviť: ${editArticle.title}` : 'Nový článok'}</h2>
            <label>Nadpis<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label style={{ marginBottom: '0.5rem', display: 'block' }}>Obsah</label>
            <RichTextEditor value={form.content} onChange={c => setForm(f => ({ ...f, content: c }))} />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <label style={{ flex: 1 }}>Stav
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}>
                  <option value="draft">Návrh</option><option value="published">Publikovaný</option>
                </select>
              </label>
              <label style={{ flex: 1 }}>Viditeľnosť
                <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value as 'public' | 'members' })}>
                  <option value="public">🌐 Verejný</option><option value="members">🔒 Len pre členov</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={save} disabled={saving}>{saving ? 'Ukladám…' : '✅ Uložiť'}</button>
              <button type="button" style={{ background: '#f0f0f0', color: '#333' }} onClick={closeModal}>Zatvoriť</button>
              {editArticle && <button type="button" style={{ background: '#dc2626', color: '#fff', marginLeft: 'auto' }} onClick={del}>🗑 Zmazať</button>}
            </div>
          </div>
        </Overlay>
      )}
    </section>
  );
}
