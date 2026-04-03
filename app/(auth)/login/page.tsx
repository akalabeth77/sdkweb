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
        <label>{t.auth.email}<input name="email" type="email" required defaultValue="admin@swing.local" /></label>
        <label>{t.auth.password}<input name="password" type="password" required defaultValue="admin123" /></label>
        <button type="submit">{t.auth.loginButton}</button>
      </form>
      <p className="small">{t.auth.noAccount} <Link href="/register">{t.auth.registerLink}</Link></p>
      <p className="small">{t.auth.demoAccounts}</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
    </section>
  );
}
