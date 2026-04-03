import Link from 'next/link';
import Image from 'next/image';
import { fetchPortalData } from '@/lib/social';
import { getArticles } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getSourceLabel, getStatusLabel, toDateLocale } from '@/lib/i18n';

export default async function HomePage() {
  const { locale, t } = getServerMessages();
  const dateLocale = toDateLocale(locale);
  const [{ events, media }, articles] = await Promise.all([fetchPortalData(), getArticles()]);

  return (
    <div className="grid" style={{ gap: '1.2rem' }}>
      <section className="card">
        <h1>{t.home.title}</h1>
        <p>{t.home.intro}</p>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>{t.home.upcomingEvents}</h2>
          {events.slice(0, 3).map((event) => (
            <p key={event.id}>
              <strong>{event.title}</strong>
              <br />
              <span className="small">{new Date(event.start).toLocaleString(dateLocale)} · {getSourceLabel(locale, event.source)}</span>
            </p>
          ))}
          <Link href="/events">{t.home.viewAllEvents}</Link>
        </div>

        <div className="card">
          <h2>{t.home.latestArticles}</h2>
          {articles.slice(0, 3).map((article) => (
            <p key={article.id}>
              <strong>{article.title}</strong>
              <br />
              <span className="small">{new Date(article.createdAt).toLocaleDateString(dateLocale)} · {getStatusLabel(locale, article.status)}</span>
            </p>
          ))}
          <Link href="/articles">{t.home.goToArticles}</Link>
        </div>
      </section>

      <section className="card">
        <h2>{t.home.galleryPreview}</h2>
        <div className="grid grid-2">
          {media.slice(0, 2).map((item) => (
            <figure key={item.id}>
              <Image
                src={item.imageUrl}
                alt={item.caption ?? t.home.swingPhoto}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ width: '100%', height: 'auto' }}
              />
              <figcaption className="small">{item.caption}{item.albumTitle ? ` · ${item.albumTitle}` : ''}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
