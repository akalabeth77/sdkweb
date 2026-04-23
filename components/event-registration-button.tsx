'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

type RegistrationStatus = 'registered' | 'waiting' | 'cancelled' | 'attended' | null;

interface EventRegistrationButtonProps {
  eventId: string;
}

export function EventRegistrationButton({ eventId }: EventRegistrationButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<RegistrationStatus>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchRegistrationStatus();
    }
  }, [session, eventId]);

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch('/api/v1/user/registrations');
      if (response.ok) {
        const data = await response.json();
        const registration = data.data.find((reg: any) => reg.event.id === eventId);
        setStatus(registration?.status || null);
      }
    } catch (error) {
      console.error('Failed to fetch registration status:', error);
    }
  };

  const handleRegistration = async (newStatus: 'registered' | 'cancelled') => {
    setLoading(true);
    try {
      const method = newStatus === 'cancelled' ? 'DELETE' : 'POST';
      const response = await fetch(`/api/v1/events/${eventId}/register`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatus(newStatus === 'cancelled' ? null : newStatus);
      }
    } catch (error) {
      console.error('Failed to update registration:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-sm text-gray-600">
        Prihláste sa pre registráciu na event
      </div>
    );
  }

  const getButtonText = () => {
    if (loading) return 'Načítava sa...';
    if (status === 'registered') return 'Zrušiť registráciu';
    if (status === 'waiting') return 'Ste na čakacej listine';
    return 'Registrovať sa';
  };

  const getButtonClass = () => {
    if (status === 'registered') return 'bg-red-600 hover:bg-red-700';
    if (status === 'waiting') return 'bg-yellow-600 hover:bg-yellow-700';
    return 'bg-green-600 hover:bg-green-700';
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => handleRegistration(status === 'registered' ? 'cancelled' : 'registered')}
        disabled={loading}
        className={`text-white px-4 py-2 rounded transition-colors ${getButtonClass()}`}
      >
        {getButtonText()}
      </button>

      {status && (
        <div className="text-sm text-gray-600">
          {status === 'registered' && 'Ste registrovaný na tento event'}
          {status === 'waiting' && 'Ste na čakacej listine'}
          {status === 'attended' && 'Zúčastnili ste sa tohto eventu'}
        </div>
      )}
    </div>
  );
}