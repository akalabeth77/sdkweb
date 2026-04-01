import { fetchPortalData } from '@/lib/social';

export const revalidate = 900;

export default async function EventsPage() {
  const { events } = await fetchPortalData();

  return (
    <section className="card">
      <h1>Eventy</h1>
      {events.map((event) => (
        <article key={event.id} style={{ marginBottom: '1rem' }}>
          <strong>{event.title}</strong>
          <div className="small">
            {new Date(event.start).toLocaleString('sk-SK')}
            {event.location ? ` · ${event.location}` : ''} · {event.source}
          </div>
        </article>
      ))}
    </section>
  );
}
