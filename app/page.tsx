import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPortalData } from '@/lib/social';
import { getArticles } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryLabel, getSourceLabel, getStatusLabel, toDateLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Swing Dance Kosice - kurzy tanca Lindy Hop Kosice',
  description: 'Kurzy swingoveho tanca v Kosiciach. Nauc sa Lindy Hop, spoznaj komunitu a zazij swingove tanciarne. Zaciatocnici vitani.',
  keywords: [
    'kurzy tanca Kosice',
    'Lindy Hop Kosice',
    'swing dance Kosice',
    'tanecne kurzy pre zaciatocnikov Kosice',
    'Collegiate Shag Kosice',
  ],
};

export default async function HomePage() {
  const { locale, t } = getServerMessages();
  const dateLocale = toDateLocale(locale);
  const [{ events, media }, articles] = await Promise.all([fetchPortalData(), getArticles()]);

  return (
    <div className="grid" style={{ gap: '1.2rem' }}>
      <section className="card">
        <h1>{t.home.title}</h1>
        <p>{t.home.intro}</p>
        <p>{t.home.introSecondary}</p>
        <p>
          <Link href="/about">{t.home.ctaAbout}</Link>
        </p>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>{t.home.coursesTitle}</h2>
          <p>{t.home.coursesLead}</p>
          <p>{t.home.coursesItems}</p>
        </div>
        <div className="card">
          <h2>{t.home.socialsTitle}</h2>
          <p>{t.home.socialsLead}</p>
          <h3>{t.home.whyTitle}</h3>
          <p>{t.home.whyLead}</p>
          <p><strong>{t.home.finalTagline}</strong></p>
          <p>{t.home.finalCta}</p>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>{t.home.upcomingEvents}</h2>
          {events.slice(0, 3).map((event) => (
            <p key={event.id}>
              <strong>{event.title}</strong>
              <br />
              <span className="small">{new Date(event.start).toLocaleString(dateLocale)} · {getEventCategoryLabel(locale, event.category)} · {getSourceLabel(locale, event.source)}</span>
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
