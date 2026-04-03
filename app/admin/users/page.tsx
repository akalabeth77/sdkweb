'use client';

import { useEffect, useState } from 'react';

type PendingUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [message, setMessage] = useState('');

  async function loadUsers() {
    const response = await fetch('/api/admin/users', { cache: 'no-store' });

    if (response.status === 403) {
      setMessage('Túto sekciu môže používať iba admin.');
      setUsers([]);
      return;
    }

    if (!response.ok) {
      setMessage('Nepodarilo sa načítať používateľov.');
      return;
    }

    const payload = (await response.json()) as PendingUser[];
    setUsers(payload);
    setMessage('');
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function updateUser(id: string, action: 'approve' | 'reject') {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      setMessage(action === 'approve' ? 'Používateľ bol schválený.' : 'Používateľ bol zamietnutý.');
      await loadUsers();
      return;
    }

    const payload = (await response.json().catch(() => ({ error: 'Operácia zlyhala.' }))) as { error?: string };
    setMessage(payload.error ?? 'Operácia zlyhala.');
  }

  return (
    <section className="card">
      <h1>Schvaľovanie používateľov</h1>
      {message ? <p className="small">{message}</p> : null}

      {users.length === 0 ? (
        <p className="small">Žiadne čakajúce registrácie.</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {users.map((user) => (
            <article key={user.id} className="card">
              <strong>{user.name}</strong>
              <div className="small">{user.email}</div>
              <div className="small">Registrovaný: {new Date(user.createdAt).toLocaleString('sk-SK')}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => void updateUser(user.id, 'approve')}>Schváliť</button>
                <button type="button" onClick={() => void updateUser(user.id, 'reject')}>Zamietnuť</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
