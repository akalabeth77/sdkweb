'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/components/language-context';
import { toDateLocale } from '@/lib/i18n';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
};

const ROLES = ['admin', 'editor', 'member'] as const;

function roleLabel(role: string) {
  if (role === 'admin') return 'Admin';
  if (role === 'editor') return 'Editor';
  return 'Člen';
}

function statusBadge(status: string) {
  if (status === 'approved') return <span style={{ color: '#059669', fontWeight: 700 }}>✓ Aktívny</span>;
  if (status === 'rejected') return <span style={{ color: '#dc2626' }}>✕ Zamietnutý</span>;
  return <span style={{ color: '#d97706' }}>⏳ Čakajúci</span>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [message, setMessage] = useState('');
  const { locale } = useLanguage();

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    if (!res.ok) { setLoading(false); return; }
    const all = (await res.json()) as UserRecord[];
    setUsers(all.filter((u) => u.status !== 'pending').sort((a, b) => a.name.localeCompare(b.name, 'sk')));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  async function patch(id: string, body: object) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { setMessage('✅ Uložené.'); await load(); }
    else setMessage('❌ Chyba pri ukladaní.');
  }

  async function del(id: string, name: string) {
    if (!confirm(`Zmazať používateľa "${name}"? Táto akcia je nevratná.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) { setMessage('Používateľ zmazaný.'); setEditUser(null); await load(); }
    else setMessage('Chyba pri mazaní.');
  }

  return (
    <section className="card">
      <h1>👥 Používatelia</h1>
      {message && <p className="small">{message}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Hľadaj podľa mena alebo emailu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', margin: 0 }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="all">Všetky role</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="member">Člen</option>
        </select>
      </div>

      {loading ? (
        <p className="small">Načítavam…</p>
      ) : filtered.length === 0 ? (
        <p className="small">Žiadni používatelia.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8e8e8', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Meno</th>
                <th style={{ padding: '8px 12px' }}>Email</th>
                <th style={{ padding: '8px 12px' }}>Rola</th>
                <th style={{ padding: '8px 12px' }}>Stav</th>
                <th style={{ padding: '8px 12px' }}>Registrovaný</th>
                <th style={{ padding: '8px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '8px 12px', color: '#555' }}>{u.email}</td>
                  <td style={{ padding: '8px 12px' }}>{roleLabel(u.role)}</td>
                  <td style={{ padding: '8px 12px' }}>{statusBadge(u.status)}</td>
                  <td style={{ padding: '8px 12px', color: '#888', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString(toDateLocale(locale))}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <button type="button" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => { setEditUser(u); setMessage(''); }}>
                      ✏️ Upraviť
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onPatch={patch}
          onDelete={del}
        />
      )}
    </section>
  );
}

function EditModal({
  user,
  onClose,
  onPatch,
  onDelete,
}: {
  user: UserRecord;
  onClose: () => void;
  onPatch: (id: string, body: object) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onPatch(user.id, { action: 'updateProfile', name: name.trim(), email: email.trim() });
    if (role !== user.role) await onPatch(user.id, { action: 'setRole', role });
    setSaving(false);
    onClose();
  }

  async function resetPwd() {
    if (password.length < 6) return;
    setSaving(true);
    await onPatch(user.id, { action: 'resetPassword', password });
    setPassword('');
    setSaving(false);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Upraviť: {user.name}</h2>

        <label>Meno<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
        <label>
          Rola
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={save} disabled={saving}>
            {saving ? 'Ukladám…' : '✅ Uložiť zmeny'}
          </button>
          <button type="button" onClick={onClose} style={{ background: '#f0f0f0', color: '#333' }}>
            Zatvoriť
          </button>
        </div>

        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
        <label>
          Nové heslo (min 6 znakov)
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} />
        </label>
        <button type="button" onClick={resetPwd} disabled={password.length < 6 || saving}>
          🔑 Resetovať heslo
        </button>

        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
        <button
          type="button"
          style={{ background: '#dc2626', color: '#fff', width: '100%' }}
          onClick={() => void onDelete(user.id, user.name)}
        >
          🗑 Zmazať používateľa
        </button>
      </div>
    </div>
  );
}
