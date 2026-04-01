import Link from 'next/link';
import { fetchPortalData } from '@/lib/social';
import { getArticles } from '@/lib/store';

export default async function HomePage() {
  const [{ events, media }, articles] = await Promise.all([fetchPortalData(), getArticles()]);

  return (
    <div className="grid" style={{ gap: '1.2rem' }}>
      <section className="card">
        <h1>Online portál swing komunity</h1>
        <p>
          Funkčný MVP portál pripravený pre Vercel: eventy, galéria, články, prihlásenie a admin editor.
        </p>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>Najbližšie eventy</h2>
          {events.slice(0, 3).map((event) => (
            <p key={event.id}>
              <strong>{event.title}</strong>
              <br />
              <span className="small">{new Date(event.start).toLocaleString('sk-SK')} · {event.source}</span>
            </p>
          ))}
          <Link href="/events">Zobraziť všetky eventy</Link>
        </div>

        <div className="card">
          <h2>Posledné články</h2>
          {articles.slice(0, 3).map((article) => (
            <p key={article.id}>
              <strong>{article.title}</strong>
              <br />
              <span className="small">{new Date(article.createdAt).toLocaleDateString('sk-SK')}</span>
            </p>
          ))}
          <Link href="/articles">Prejsť na články</Link>
        </div>
      </section>

      <section className="card">
        <h2>Ukážka galérie</h2>
        <div className="grid grid-2">
          {media.slice(0, 2).map((item) => (
            <figure key={item.id}>
              <img src={item.imageUrl} alt={item.caption ?? 'Swing photo'} />
              <figcaption className="small">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
