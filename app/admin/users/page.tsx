'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/language-context';
import { toDateLocale } from '@/lib/i18n';

type PendingUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [message, setMessage] = useState('');
  const { locale, t } = useLanguage();

  async function loadUsers() {
    const response = await fetch('/api/admin/users', { cache: 'no-store' });

    if (response.status === 403) {
      setMessage(t.admin.adminOnly);
      setUsers([]);
      return;
    }

    if (!response.ok) {
      setMessage(t.admin.loadUsersError);
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
      setMessage(action === 'approve' ? t.admin.userApproved : t.admin.userRejected);
      await loadUsers();
      return;
    }

    const payload = (await response.json().catch(() => ({ error: t.admin.operationFailed }))) as { error?: string };
    setMessage(payload.error ?? t.admin.operationFailed);
  }

  return (
    <section className="card">
      <h1>{t.admin.userApprovalTitle}</h1>
      {message ? <p className="small">{message}</p> : null}

      {users.length === 0 ? (
        <p className="small">{t.common.noPendingRegistrations}</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {users.map((user) => (
            <article key={user.id} className="card">
              <strong>{user.name}</strong>
              <div className="small">{user.email}</div>
              <div className="small">{t.common.registeredAt}: {new Date(user.createdAt).toLocaleString(toDateLocale(locale))}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => void updateUser(user.id, 'approve')}>{t.common.approve}</button>
                <button type="button" onClick={() => void updateUser(user.id, 'reject')}>{t.common.reject}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
