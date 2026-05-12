'use client';

import { FormEvent, useState } from 'react';

export default function AdminPushPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      if (res.ok) {
        setMessage('✅ Notifikácia bola odoslaná na všetky zariadenia.');
        setTitle('');
        setBody('');
      } else {
        const data = await res.json();
        setMessage(`❌ Chyba: ${JSON.stringify(data.error)}`);
      }
    } catch {
      setMessage('❌ Nepodarilo sa odoslať notifikáciu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1>Push notifikácie</h1>
      <p className="small">Odoslanie notifikácie na všetky registrované mobilné zariadenia.</p>
      <form onSubmit={handleSend} style={{ maxWidth: '480px' }}>
        <label>
          Nadpis (max 100 znakov)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            placeholder="Napr. Nový event tento piatok!"
          />
        </label>
        <label>
          Správa (max 300 znakov)
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={300}
            required
            rows={4}
            placeholder="Text notifikácie…"
            style={{ width: '100%' }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Odosiela sa…' : '📲 Odoslať notifikáciu'}
        </button>
      </form>
      {message ? <p className="small" style={{ marginTop: '1rem' }}>{message}</p> : null}
    </section>
  );
}
