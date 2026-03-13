import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';
import { Locale } from '@/lib/i18n';
import { urlFor } from '@/lib/sanity.image';

export function EventCard({ event, lang }: { event: Event; lang: Locale }) {
  return (
    <article className="card overflow-hidden p-0">
      {event.coverImage ? (
        <Image
          src={urlFor(event.coverImage).width(800).height(300).url()}
          alt={event.title[lang]}
          width={800}
          height={300}
          className="h-44 w-full object-cover"
        />
      ) : null}
      <div className="space-y-2 p-5">
        <p className="text-xs uppercase text-brand">{event.eventType}</p>
        <h3 className="text-xl font-semibold">{event.title[lang]}</h3>
        <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{event.description?.[lang]}</p>
        <p className="text-sm">{new Date(event.date).toLocaleDateString(lang)}</p>
        <Link href={`/${lang}/events/${event.slug.current}`} className="text-sm font-semibold text-brand">Detail →</Link>
      </div>
    </article>
  );
}
