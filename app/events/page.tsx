import { fetchPortalData } from '@/lib/social';
import { getServerMessages } from '@/lib/i18n-server';
import { getSourceLabel, toDateLocale } from '@/lib/i18n';

export const revalidate = 900;

export default async function EventsPage() {
  const { locale, t } = getServerMessages();
  const { events } = await fetchPortalData();

  return (
    <section className="card">
      <h1>{t.events.title}</h1>
      {events.map((event) => (
        <article key={event.id} style={{ marginBottom: '1rem' }}>
          <strong>{event.title}</strong>
          <div className="small">
            {new Date(event.start).toLocaleString(toDateLocale(locale))}
            {event.location ? ` · ${event.location}` : ''} · {getSourceLabel(locale, event.source)}
          </div>
        </article>
      ))}
    </section>
  );
}
