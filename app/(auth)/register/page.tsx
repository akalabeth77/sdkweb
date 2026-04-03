'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useLanguage } from '@/components/language-context';

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const { t } = useLanguage();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        name: formData.get('name'),
        password: formData.get('password'),
      }),
    });

    if (response.ok) {
      setMessage(t.auth.registerSuccess);
      event.currentTarget.reset();
      return;
    }

    if (response.status === 409) {
      setMessage(t.auth.registerExists);
      return;
    }

    if (response.status === 503) {
      setMessage(t.auth.registerUnavailable);
      return;
    }

    const payload = (await response.json().catch(() => ({ error: t.auth.registerFailed }))) as { error?: string };
    setMessage(payload.error ?? t.auth.registerFailed);
  }

  return (
    <section className="card" style={{ maxWidth: 480 }}>
      <h1>{t.auth.registerTitle}</h1>
      <form onSubmit={onSubmit}>
        <label>{t.auth.name}<input name="name" required minLength={2} /></label>
        <label>{t.auth.email}<input name="email" type="email" required /></label>
        <label>{t.auth.password}<input name="password" type="password" required minLength={8} /></label>
        <button type="submit">{t.auth.registerButton}</button>
      </form>
      {message ? <p className="small">{message}</p> : null}
      <p className="small">{t.auth.haveAccount} <Link href="/login">{t.auth.loginLink}</Link></p>
    </section>
  );
}
