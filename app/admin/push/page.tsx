'use client';

import { FormEvent, useState } from 'react';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!sendPush && !sendEmail) {
      setMessage('❌ Vyber aspoň jeden kanál (push alebo email).');
      return;
    }
    setLoading(true);
    setMessage('');
    const channels: string[] = [];
    if (sendPush) channels.push('push');
    if (sendEmail) channels.push('email');
    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, channels }),
      });
      if (res.ok) {
        const channelNames = channels.map((c) => (c === 'push' ? 'push notifikácia' : 'email')).join(' + ');
        setMessage(`✅ Správa odoslaná cez: ${channelNames}.`);
        setTitle('');
        setBody('');
      } else {
        const data = await res.json();
        setMessage(`❌ Chyba: ${JSON.stringify(data.error)}`);
      }
    } catch {
      setMessage('❌ Nepodarilo sa odoslať správu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1>Správa všetkým</h1>
      <p className="small">Odošle správu všetkým registrovaným používateľom cez vybrané kanály.</p>
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
            placeholder="Text správy…"
            style={{ width: '100%' }}
          />
        </label>
        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <legend style={{ fontSize: '0.85rem', color: '#666', padding: '0 0.25rem' }}>Kanály</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontWeight: 'normal' }}>
            <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
            📲 Push notifikácia (mobilná appka)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            ✉️ Email (všetci s povoleným emailom)
          </label>
        </fieldset>
        <button type="submit" disabled={loading}>
          {loading ? 'Odosiela sa…' : '📣 Odoslať správu'}
        </button>
      </form>
      {message ? <p className="small" style={{ marginTop: '1rem' }}>{message}</p> : null}
    </section>
  );
}
