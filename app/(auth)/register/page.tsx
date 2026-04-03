'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [message, setMessage] = useState('');

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
      setMessage('Registrácia bola prijatá. Účet čaká na schválenie adminom.');
      event.currentTarget.reset();
      return;
    }

    const payload = (await response.json().catch(() => ({ error: 'Registrácia zlyhala.' }))) as { error?: string };
    setMessage(payload.error ?? 'Registrácia zlyhala.');
  }

  return (
    <section className="card" style={{ maxWidth: 480 }}>
      <h1>Registrácia</h1>
      <form onSubmit={onSubmit}>
        <label>Meno<input name="name" required minLength={2} /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Heslo<input name="password" type="password" required minLength={8} /></label>
        <button type="submit">Vytvoriť účet</button>
      </form>
      {message ? <p className="small">{message}</p> : null}
      <p className="small">Už máte účet? <Link href="/login">Prihlásiť sa</Link></p>
    </section>
  );
}
