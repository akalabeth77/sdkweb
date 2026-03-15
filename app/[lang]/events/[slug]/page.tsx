import { safeFetch } from '@/lib/sanity.client';
import { eventBySlugQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';
import { urlFor } from '@/lib/sanity.image';
import Image from 'next/image';
import Script from 'next/script';

export default async function EventDetail({ params }: { params: { lang: Locale; slug: string } }) {
  const event = await safeFetch<Record<string, any> | null>(eventBySlugQuery, { slug: params.slug }, null);
  const title = event?.title?.[params.lang] || '';
  return (
    <article className="space-y-4">
      {event?.coverImage && (
        <Image
          src={urlFor(event.coverImage).width(1400).height(640).url()}
          alt={title}
          width={1400}
          height={640}
          className="h-80 w-full rounded-3xl object-cover"
        />
      )}
      <h1 className="text-3xl font-bold">{title}</h1>
      <p>{event?.description?.[params.lang]}</p>
      <p>{new Date(event?.date).toLocaleString(params.lang)}</p>
      {event?.location?.mapsUrl && <iframe src={event.location.mapsUrl} className="h-64 w-full rounded-xl" loading="lazy" />}
      <a href={`/api/events/${params.slug}/ics`} className="inline-block rounded bg-brand px-4 py-2 text-white">ICS Export</a>
      <Script
        id="event-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Event', name: title, startDate: event?.date, location: { '@type': 'Place', name: event?.location?.name, address: event?.location?.address } })
        }}
      />
    </article>
  );
}
