'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v1/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchProfile(); // Refresh profile
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Môj profil</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Základné informácie</h2>
          <div className="space-y-2">
            <p><strong>Meno:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Rola:</strong> {session.user?.role}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Údaje profilu</h2>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            updateProfile({
              bio: formData.get('bio') as string,
              phone: formData.get('phone') as string,
              avatarUrl: formData.get('avatarUrl') as string
            });
          }}>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar URL</label>
              <input
                type="url"
                name="avatarUrl"
                defaultValue={profile?.avatarUrl || ''}
                className="w-full p-2 border rounded"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio || ''}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Niečo o sebe..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefón</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile?.phone || ''}
                className="w-full p-2 border rounded"
                placeholder="+421..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Ukladanie...' : 'Uložiť zmeny'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}