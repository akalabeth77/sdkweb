'use client';

import { useCallback, useEffect, useState } from 'react';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
};

export default function ApprovalsPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    if (!res.ok) { setLoading(false); return; }
    const all = (await res.json()) as UserRecord[];
    setUsers(all.filter((u) => u.status === 'pending'));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handle(id: string, action: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setMessage(res.ok
      ? (action === 'approve' ? '✅ Účet schválený.' : '❌ Účet zamietnutý.')
      : 'Chyba pri operácii.');
    if (res.ok) await load();
  }

  return (
    <section className="card">
      <h1>Schvaľovanie účtov</h1>
      {message && <p className="small">{message}</p>}

      {loading ? (
        <p className="small">Načítavam…</p>
      ) : users.length === 0 ? (
        <p className="small">✅ Žiadne čakajúce registrácie.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #e8e8e8' }}>
              <div style={{ flex: 1 }}>
                <strong>{u.name}</strong>
                <span style={{ color: '#666', marginLeft: '0.5rem', fontSize: '0.9rem' }}>{u.email}</span>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>
                  Registrovaný: {new Date(u.createdAt).toLocaleDateString('sk-SK')}
                </div>
              </div>
              <button
                type="button"
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => void handle(u.id, 'approve')}
              >
                ✓ Schváliť
              </button>
              <button
                type="button"
                style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => void handle(u.id, 'reject')}
              >
                ✕ Zamietnuť
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
