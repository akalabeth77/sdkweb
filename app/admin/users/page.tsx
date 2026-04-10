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

function roleLabel(role: string, t: ReturnType<typeof useLanguage>['t']) {
  if (role === 'admin') return t.admin.roleAdmin;
  if (role === 'editor') return t.admin.roleEditor;
  return t.admin.roleMember;
}

function statusLabel(status: string, t: ReturnType<typeof useLanguage>['t']) {
  if (status === 'pending') return t.admin.statusPending;
  if (status === 'approved') return t.admin.statusApproved;
  if (status === 'rejected') return t.admin.statusRejected;
  return status;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [message, setMessage] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const { locale, t } = useLanguage();

  const loadUsers = useCallback(async () => {
    const response = await fetch('/api/admin/users', { cache: 'no-store' });

    if (response.status === 403) {
      setForbidden(true);
      setUsers([]);
      return;
    }

    if (!response.ok) {
      setMessage(t.admin.loadUsersError);
      return;
    }

    const payload = (await response.json()) as UserRecord[];
    setUsers(payload);
    setMessage('');
  }, [t.admin.loadUsersError]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleApproval(id: string, action: 'approve' | 'reject') {
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

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(payload.error ?? t.admin.operationFailed);
  }

  async function handleSetRole(id: string, role: string) {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setRole', role }),
    });

    if (response.ok) {
      setMessage(t.admin.userRoleUpdated);
      await loadUsers();
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(payload.error ?? t.admin.userRoleUpdateError);
  }

  async function handleUpdateProfile(id: string, name: string, email: string) {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateProfile', name, email }),
    });

    if (response.ok) {
      setMessage(t.admin.userProfileUpdated);
      await loadUsers();
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(payload.error ?? t.admin.userProfileUpdateError);
  }

  async function handleResetPassword(id: string, password: string) {
    if (password.length < 6) {
      setMessage(t.admin.userPasswordTooShort);
      return;
    }

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetPassword', password }),
    });

    if (response.ok) {
      setMessage(t.admin.userPasswordReset);
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(payload.error ?? t.admin.userPasswordResetError);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${t.admin.confirmDeleteUser}\n\n${name}`)) return;

    const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setMessage(t.admin.userDeleted);
      await loadUsers();
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(payload.error ?? t.admin.userDeleteError);
  }

  if (forbidden) {
    return (
      <section className="card">
        <h1>{t.admin.userEditorTitle}</h1>
        <p className="small">{t.admin.adminOnly}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>{t.admin.userEditorTitle}</h1>
      {message ? <p className="small">{message}</p> : null}

      {users.length === 0 ? (
        <p className="small">{t.admin.noUsers}</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {users.map((user) => (
            <UserEditorCard
              key={user.id}
              user={user}
              locale={locale}
              onApprove={handleApproval}
              onSetRole={handleSetRole}
              onUpdateProfile={handleUpdateProfile}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function UserEditorCard({
  user,
  locale,
  onApprove,
  onSetRole,
  onUpdateProfile,
  onResetPassword,
  onDelete,
}: {
  user: UserRecord;
  locale: ReturnType<typeof useLanguage>['locale'];
  onApprove: (id: string, action: 'approve' | 'reject') => Promise<void>;
  onSetRole: (id: string, role: string) => Promise<void>;
  onUpdateProfile: (id: string, name: string, email: string) => Promise<void>;
  onResetPassword: (id: string, password: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  return (
    <article className="card">
      <div className="small">
        {t.admin.userStatus}: <strong>{statusLabel(user.status, t)}</strong>
        {' · '}
        {t.admin.userRole}: <strong>{roleLabel(user.role, t)}</strong>
      </div>
      <div className="small">
        {t.common.registeredAt}: {new Date(user.createdAt).toLocaleString(toDateLocale(locale))}
      </div>

      <label>
        {t.auth.name}
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        {t.auth.email}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
        <button type="button" onClick={() => void onUpdateProfile(user.id, name.trim(), email.trim())}>
          {t.admin.updateUserProfile}
        </button>

        {user.status === 'pending' && (
          <>
            <button type="button" onClick={() => void onApprove(user.id, 'approve')}>
              {t.common.approve}
            </button>
            <button type="button" onClick={() => void onApprove(user.id, 'reject')}>
              {t.common.reject}
            </button>
          </>
        )}

        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="small">{t.admin.setRole}:</span>
          <select
            value={user.role}
            onChange={(e) => void onSetRole(user.id, e.target.value)}
            style={{ margin: 0 }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{roleLabel(r, t)}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
        <label style={{ margin: 0, flex: '1 1 260px' }}>
          {t.admin.newPassword}
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={6}
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            await onResetPassword(user.id, password);
            setPassword('');
          }}
        >
          {t.admin.resetUserPassword}
        </button>

        <button
          type="button"
          style={{ marginLeft: 'auto', background: 'var(--color-danger, #dc2626)' }}
          onClick={() => void onDelete(user.id, user.name)}
        >
          {t.admin.deleteUser}
        </button>
      </div>
    </article>
  );
}

