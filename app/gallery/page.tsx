import { fetchPortalData } from '@/lib/social';
import Image from 'next/image';
import Script from 'next/script';
import { getServerMessages } from '@/lib/i18n-server';
import { getSourceLabel } from '@/lib/i18n';

export const revalidate = 900;

export default async function GalleryPage() {
  const { locale, t } = getServerMessages();
  const { media } = await fetchPortalData();

  const items = media.length > 0
    ? media.map((item) => ({
      ...item,
      caption: item.caption ?? 'Swing Dance Kosice',
    }))
    : [
      {
        id: 'logo-only',
        imageUrl: '/swing-dance-kosice-logo.jpg',
        caption: 'Swing Dance Kosice',
        source: 'internal' as const,
      },
    ];

  const hasEmbeds = items.some((item) => item.source === 'instagram-embed');

  return (
    <section className="card">
      <h1>{t.gallery.title}</h1>
      {hasEmbeds && (
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      )}
      <div className="grid grid-2">
        {items.map((item) => (
          <figure key={item.id}>
            {item.source === 'instagram-embed' ? (
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={item.imageUrl}
                data-instgrm-version="14"
                style={{ margin: '0 auto', width: '100%', maxWidth: '540px' }}
              />
            ) : item.source === 'google-photos' && item.imageUrl.startsWith('https://photos.google.com') ? (
              <a
                href={item.imageUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 1rem', background: '#f5f5f5', borderRadius: '8px', textDecoration: 'none', color: '#1a1a2e', fontWeight: 600 }}
              >
                📷 {item.caption ?? item.albumTitle} — Otvoriť album
              </a>
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.caption ?? t.gallery.imageAlt}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
            <figcaption className="small">{item.caption}{item.albumTitle ? ` · ${item.albumTitle}` : ''} ({getSourceLabel(locale, item.source)})</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
