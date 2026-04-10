import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPortalData } from '@/lib/social';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryColor, getEventCategoryLabel, getSourceLabel, toDateLocale } from '@/lib/i18n';
import { ShareButtons } from '@/components/share-buttons';

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