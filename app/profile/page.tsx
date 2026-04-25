'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { UserProfile } from '@/types';

type ProfilePayload = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: string;
  };
  profile: Pick<UserProfile, 'avatarUrl' | 'bio' | 'phone' | 'preferences'>;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payload, setPayload] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      void fetchProfile();
    }
  }, [status, router]);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/v1/user/profile', { cache: 'no-store' });
      if (!response.ok) {
        setMessage('Nepodarilo sa nacitat profil.');
        return;
      }

      const data = (await response.json()) as { data: ProfilePayload };
      setPayload(data.data);
    } catch {
      setMessage('Nepodarilo sa nacitat profil.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: String(formData.get('avatarUrl') || ''),
          bio: String(formData.get('bio') || ''),
          phone: String(formData.get('phone') || ''),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { data?: ProfilePayload; error?: string; message?: string };
      if (!response.ok) {
        setMessage(data.error ?? 'Nepodarilo sa ulozit profil.');
        return;
      }

      if (data.data) {
        setPayload(data.data);
      }
      setMessage(data.message ?? 'Profil bol ulozeny.');
    } catch {
      setMessage('Nepodarilo sa ulozit profil.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return <section className="card"><p>Nacitavam profil...</p></section>;
  }

  if (!session || !payload) {
    return null;
  }

  return (
    <section className="card">
      <div className="event-meta-row">
        <div>
          <h1>Moj profil</h1>
          <p className="small">Zakladne udaje pre web aj buducu mobilnu appku.</p>
        </div>
        <Link href="/profile/registrations" className="share-link share-btn">Moje registracie</Link>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1rem', alignItems: 'start' }}>
        <article className="card">
          <h2>Ucet</h2>
          <p><strong>Meno:</strong> {payload.user.name ?? session.user?.name ?? '-'}</p>
          <p><strong>Email:</strong> {payload.user.email ?? session.user?.email ?? '-'}</p>
          <p><strong>Rola:</strong> {payload.user.role}</p>
        </article>

        <form className="card" onSubmit={(event) => void handleSubmit(event)}>
          <h2>Profilove udaje</h2>
          <label>
            Avatar URL
            <input name="avatarUrl" type="url" defaultValue={payload.profile.avatarUrl ?? ''} placeholder="https://..." />
          </label>
          <label>
            Bio
            <textarea name="bio" defaultValue={payload.profile.bio ?? ''} rows={4} placeholder="Nieco o sebe..." />
          </label>
          <label>
            Telefon
            <input name="phone" type="tel" defaultValue={payload.profile.phone ?? ''} placeholder="+421..." />
          </label>
          <button type="submit" disabled={saving} style={{ width: 'auto', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Ukladam...' : 'Ulozit zmeny'}
          </button>
          {message ? <p className="small">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
