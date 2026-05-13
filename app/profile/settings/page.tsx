'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;
    void fetch('/api/user/preferences')
      .then((r) => r.json())
      .then((data) => {
        setEmail(data.emailNotifications !== false);
        setPush(data.pushNotifications !== false);
        setLoading(false);
      });
  }, [status, router]);

  async function handleSave() {
    await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailNotifications: email, pushNotifications: push }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <section className="card"><p>Načítavam...</p></section>;

  return (
    <section className="card" style={{ maxWidth: '480px' }}>
      <h1>Nastavenia notifikácií</h1>
      <p className="small">Zvoľ, aké upozornenia chceš dostávať.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Emailové notifikácie</div>
            <div className="small">Nové eventy, články a galéria zasielané na email.</div>
          </div>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Push notifikácie (mobilná appka)</div>
            <div className="small">Okamžité upozornenia v aplikácii KESwing.</div>
          </div>
        </label>
      </div>

      <button onClick={() => void handleSave()}>Uložiť nastavenia</button>
      {saved ? <p className="small" style={{ color: 'green', marginTop: '0.5rem' }}>✅ Nastavenia uložené.</p> : null}
    </section>
  );
}
