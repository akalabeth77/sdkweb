import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPortalData } from '@/lib/social';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryColor, getEventCategoryLabel, getSourceLabel, toDateLocale } from '@/lib/i18n';
import { ShareButtons } from '@/components/share-buttons';
import { EventRegistrationButton } from '@/components/event-registration-button';

function toGCalDate(iso: string): string {
  return iso.replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

function buildGCalUrl(title: string, start: string, end?: string, location?: string, description?: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGCalDate(start)}/${toGCalDate(end ?? start)}`,
    ...(location ? { location } : {}),
    ...(description ? { details: description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const { locale, t } = getServerMessages();
  const { events } = await fetchPortalData();
  const event = events.find((item) => item.id === decodeURIComponent(params.id));

  if (!event) {
    notFound();
  }

  return (
    <section className="card">
      <Link href="/events" className="share-link share-btn">{t.events.backToEvents}</Link>
      <div className="event-meta-row" style={{ marginTop: '1rem' }}>
        <h1>{event.title}</h1>
        <span className="event-badge" style={{ backgroundColor: getEventCategoryColor(event.category) }}>
          {getEventCategoryLabel(locale, event.category)}
        </span>
      </div>
      <div className="small">
        {new Date(event.start).toLocaleString(toDateLocale(locale))}
        {event.location ? ` · ${event.location}` : ''} · {getSourceLabel(locale, event.source)}
      </div>
      {event.description ? <div className="article-content"><p>{event.description}</p></div> : null}

      <div className="mt-6">
        <EventRegistrationButton eventId={event.id} isAvailable={event.source === 'internal'} />
      </div>

      <a
        href={buildGCalUrl(event.title, event.start, event.end, event.location, event.description)}
        target="_blank"
        rel="noreferrer"
        className="share-link share-btn"
        style={{ display: 'inline-block', marginTop: '0.75rem' }}
      >
        📅 {locale === 'sk' ? 'Pridať do Google Kalendára' : 'Add to Google Calendar'}
      </a>

      <ShareButtons
        title={event.title}
        text={event.description}
        path={`/events/${encodeURIComponent(event.id)}`}
        anchorId={event.id}
        label={t.events.shareEvent}
        copyLabel={t.common.copyLink}
        copiedLabel={t.common.copied}
      />
    </section>
  );
}
