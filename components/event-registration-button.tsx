'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

type RegistrationStatus = 'registered' | 'waiting' | 'cancelled' | 'attended' | null;

interface EventRegistrationButtonProps {
  eventId: string;
  isAvailable?: boolean;
}

export function EventRegistrationButton({ eventId, isAvailable = true }: EventRegistrationButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRegistrationStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventId)}/register`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        setRegistrationStatus(null);
        return;
      }

      const payload = (await response.json()) as { data?: { status?: RegistrationStatus } };
      setRegistrationStatus(payload.data?.status ?? null);
    } catch {
      setRegistrationStatus(null);
    }
  }, [eventId]);

  useEffect(() => {
    if (!session || !isAvailable) {
      setRegistrationStatus(null);
      return;
    }

    void fetchRegistrationStatus();
  }, [fetchRegistrationStatus, session, isAvailable]);

  async function handleRegistration(nextStatus: 'registered' | 'cancelled') {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/v1/events/${encodeURIComponent(eventId)}/register`, {
        method: nextStatus === 'cancelled' ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) {
        setMessage(payload.error ?? 'Nepodarilo sa upravit registraciu.');
        return;
      }

      setRegistrationStatus(nextStatus === 'cancelled' ? null : nextStatus);
      setMessage(payload.message ?? '');
    } catch {
      setMessage('Nepodarilo sa upravit registraciu.');
    } finally {
      setLoading(false);
    }
  }

  if (!isAvailable) {
    return <p className="small">Registracia je dostupna len pre interne eventy.</p>;
  }

  if (sessionStatus === 'loading') {
    return <p className="small">Nacitavam stav registracie...</p>;
  }

  if (!session) {
    return (
      <div className="grid" style={{ gap: '0.5rem', justifyItems: 'start' }}>
        <p className="small">Prihlaste sa, ak sa chcete registrovat na event.</p>
        <Link href="/login" className="share-link share-btn">Prihlasit sa</Link>
      </div>
    );
  }

  const isRegistered = registrationStatus === 'registered' || registrationStatus === 'attended';

  return (
    <div className="grid" style={{ gap: '0.5rem', justifyItems: 'start' }}>
      <button
        type="button"
        onClick={() => void handleRegistration(isRegistered ? 'cancelled' : 'registered')}
        disabled={loading}
        style={{
          width: 'auto',
          background: isRegistered ? '#b91c1c' : '#166534',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Ukladam...' : isRegistered ? 'Zrusit registraciu' : 'Registrovat sa'}
      </button>

      {registrationStatus === 'registered' ? <p className="small">Ste registrovany na tento event.</p> : null}
      {registrationStatus === 'waiting' ? <p className="small">Ste na cakacej listine.</p> : null}
      {registrationStatus === 'attended' ? <p className="small">Tento event mate oznaceny ako absolvovany.</p> : null}
      {message ? <p className="small">{message}</p> : null}
    </div>
  );
}
