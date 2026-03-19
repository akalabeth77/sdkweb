'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!response.ok) {
      setError('Nesprávny email alebo heslo.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block">Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block">Heslo</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="w-full rounded bg-brand px-4 py-2 font-medium text-white disabled:opacity-70">
        {loading ? 'Prihlasujem…' : 'Prihlásiť'}
      </button>
    </form>
  );
}
