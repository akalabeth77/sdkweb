'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EventRegisterPage() {
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, notes: notes || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? 'Registrácia zlyhala.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Chyba spojenia. Skús znova.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="card" style={{ maxWidth: '480px' }}>
        <h1>✅ Registrácia odoslaná</h1>
        <p>Ďakujeme! Tvoja registrácia bola prijatá. Čoskoro sa ti ozveme.</p>
        <Link href={`/events/${encodeURIComponent(id)}`} className="share-link share-btn">← Späť na event</Link>
      </section>
    );
  }

  return (
    <section className="card" style={{ maxWidth: '480px' }}>
      <h1>Registrácia na event</h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label>Meno *<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email *<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Telefón<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+421 900 000 000" /></label>
        <label>Poznámka<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></label>
        {error ? <p className="small" style={{ color: 'red' }}>{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Odosiela sa...' : 'Registrovať sa'}</button>
      </form>
      <Link href={`/events/${encodeURIComponent(id)}`} className="small" style={{ display: 'block', marginTop: '1rem' }}>← Späť na event</Link>
    </section>
  );
}
