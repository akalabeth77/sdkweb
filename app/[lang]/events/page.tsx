import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { eventsQuery } from '@/lib/queries';
import { Event } from '@/types';
import { Locale } from '@/lib/i18n';
import { EventCard } from '@/components/EventCard';

export default async function EventsPage({
  params,
  searchParams
}: {
  params: { lang: Locale };
  searchParams: { type?: string; style?: string };
}) {
  const events: Event[] = await client.fetch(eventsQuery);
  const filtered = events.filter((e) => (!searchParams.type || e.eventType === searchParams.type) && (!searchParams.style || e.danceStyle === searchParams.style));

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{params.lang === 'sk' ? 'Podujatia' : 'Events'}</h1>
      <div className="flex gap-2 text-sm">
        <Link href={`/${params.lang}/events`} className="rounded border px-3 py-1">All</Link>
        {['party', 'workshop', 'course', 'festival'].map((type) => <Link key={type} href={`/${params.lang}/events?type=${type}`} className="rounded border px-3 py-1">{type}</Link>)}
      </div>
      <div className="grid gap-4 md:grid-cols-3">{filtered.map((event) => <EventCard key={event._id} event={event} lang={params.lang} />)}</div>
    </section>
  );
}
