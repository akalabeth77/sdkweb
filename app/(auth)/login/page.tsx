'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/language-context';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { t } = useLanguage();

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
        setError(t.auth.configError);
        return;
      }

      if (result.error === 'AccountNotApproved') {
        setError(t.auth.notApproved);
        return;
      }

      setError(t.auth.invalidCredentials);
      return;
    }

    router.push('/admin');
  }

  return (
    <section className="card" style={{ maxWidth: 420 }}>
      <h1>{t.auth.loginTitle}</h1>
      <form onSubmit={onSubmit}>
        <label>{t.auth.email}<input name="email" type="email" required /></label>
        <label>{t.auth.password}<input name="password" type="password" required /></label>
        <button type="submit">{t.auth.loginButton}</button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>alebo</span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
      </div>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/admin' })}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: '#1a1a2e' }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Prihlásiť sa cez Google
      </button>
      <p className="small" style={{ marginTop: '1rem' }}>{t.auth.noAccount} <Link href="/register">{t.auth.registerLink}</Link></p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
    </section>
  );
}
