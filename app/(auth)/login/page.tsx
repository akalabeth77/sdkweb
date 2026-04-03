'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      if (result.error === 'Configuration') {
        setError('Chyba konfigurácie servera (NEXTAUTH_SECRET/NEXTAUTH_URL). Kontaktujte administrátora.');
        return;
      }

      setError('Nesprávne prihlasovacie údaje.');
      return;
    }

    router.push('/admin/articles/new');
  }

  return (
    <section className="card" style={{ maxWidth: 420 }}>
      <h1>Prihlásenie</h1>
      <form onSubmit={onSubmit}>
        <label>Email<input name="email" type="email" required defaultValue="admin@swing.local" /></label>
        <label>Heslo<input name="password" type="password" required defaultValue="admin123" /></label>
        <button type="submit">Prihlásiť sa</button>
      </form>
      <p className="small">Demo účty: admin/editor/member @swing.local (heslá: admin123/editor123/member123).</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
    </section>
  );
}
