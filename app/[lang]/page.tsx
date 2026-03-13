import { Hero } from '@/components/Hero';
import { EventCard } from '@/components/EventCard';
import { Locale } from '@/lib/i18n';
import { client } from '@/lib/sanity.client';
import { homeQuery } from '@/lib/queries';
import { Event } from '@/types';

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const data = await client.fetch(homeQuery);
  return (
    <div className="space-y-8">
      <Hero lang={params.lang} intro={data?.settings?.introText?.[params.lang]} mediaUrl={data?.settings?.heroVideoUrl || data?.settings?.heroImageUrl} />
      <section>
        <h2 className="mb-4 text-2xl font-semibold">{params.lang === 'sk' ? 'Najbližšie podujatia' : 'Upcoming events'}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.upcomingEvents || []).map((event: Event) => <EventCard key={event._id} event={event} lang={params.lang} />)}
        </div>
      </section>
    </div>
  );
}
