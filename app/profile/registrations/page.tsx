import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEventCategoryLabel, toDateLocale } from '@/lib/i18n';
import { getServerMessages } from '@/lib/i18n-server';
import { listUserEventRegistrations } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { locale } = getServerMessages();
  const registrations = await listUserEventRegistrations(session.user.id);
  const activeRegistrations = registrations.filter((registration) => registration.status !== 'cancelled');
  const cancelledRegistrations = registrations.filter((registration) => registration.status === 'cancelled');

  return (
    <section className="card">
      <Link href="/profile" className="share-link share-btn">Spat na profil</Link>
      <h1 style={{ marginTop: '1rem' }}>Moje registracie</h1>

      <section style={{ marginTop: '1rem' }}>
        <h2>Aktivne registracie</h2>
        {activeRegistrations.length === 0 ? (
          <p className="small">Zatial nemate ziadne aktivne registracie.</p>
        ) : (
          <div className="grid">
            {activeRegistrations.map((registration) => (
              <article key={registration.id} className="card">
                <div className="event-meta-row">
                  <div>
                    <Link href={`/events/${encodeURIComponent(registration.event.id)}`} className="share-link share-btn">
                      {registration.event.title}
                    </Link>
                    <p className="small" style={{ marginTop: '0.75rem' }}>
                      {new Date(registration.event.start).toLocaleString(toDateLocale(locale))}
                      {registration.event.location ? ` · ${registration.event.location}` : ''}
                    </p>
                  </div>
                  <span className="event-badge" style={{ backgroundColor: '#166534' }}>
                    {registration.status}
                  </span>
                </div>
                <p className="small">{getEventCategoryLabel(locale, registration.event.category)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {cancelledRegistrations.length > 0 ? (
        <section style={{ marginTop: '1.5rem' }}>
          <h2>Zrusene registracie</h2>
          <div className="grid">
            {cancelledRegistrations.map((registration) => (
              <article key={registration.id} className="card">
                <strong>{registration.event.title}</strong>
                <p className="small">{new Date(registration.event.start).toLocaleString(toDateLocale(locale))}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
