'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  createdAt: string;
};

export function UsersAdminPanel({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR'>('EDITOR');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    if (!response.ok) {
      setMessage(await response.text());
      setBusy(false);
      return;
    }

    const created = (await response.json()) as ManagedUser;
    setUsers((prev) => [created, ...prev]);
    setName('');
    setEmail('');
    setPassword('');
    setRole('EDITOR');
    setMessage('Používateľ bol vytvorený.');
    setBusy(false);
  }

  async function deleteManagedUser(id: string) {
    setBusy(true);
    setMessage('');

    const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage(await response.text());
      setBusy(false);
      return;
    }

    setUsers((prev) => prev.filter((user) => user.id !== id));
    setMessage('Používateľ bol odstránený.');
    setBusy(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/signin');
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={logout} className="rounded border px-3 py-1 text-sm">
          Odhlásiť
        </button>
      </div>

      <form onSubmit={createUser} className="card space-y-3">
        <h2 className="text-xl font-semibold">Pridať používateľa</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Meno" value={name} onChange={(event) => setName(event.target.value)} className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" required />
          <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" required />
          <input type="password" placeholder="Heslo (min. 8 znakov)" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" minLength={8} required />
          <select value={role} onChange={(event) => setRole(event.target.value as 'ADMIN' | 'EDITOR')} className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit" disabled={busy} className="rounded bg-brand px-4 py-2 text-white disabled:opacity-70">Vytvoriť používateľa</button>
      </form>

      {message && <p className="text-sm">{message}</p>}

      <div className="card overflow-x-auto">
        <h2 className="mb-3 text-xl font-semibold">Existujúci používatelia</h2>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2">Meno</th>
              <th className="py-2">Email</th>
              <th className="py-2">Rola</th>
              <th className="py-2">Vytvorený</th>
              <th className="py-2">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-200/70 dark:border-zinc-700/70">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="py-2">
                  <button type="button" onClick={() => deleteManagedUser(user.id)} disabled={busy} className="rounded border border-red-300 px-2 py-1 text-red-700 disabled:opacity-70 dark:border-red-700 dark:text-red-300">
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
