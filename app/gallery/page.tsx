import { fetchPortalData } from '@/lib/social';
import Image from 'next/image';
import { getServerMessages } from '@/lib/i18n-server';
import { getSourceLabel } from '@/lib/i18n';

export const revalidate = 900;

export default async function GalleryPage() {
  const { locale, t } = getServerMessages();
  const { media } = await fetchPortalData();

  const items = media.length > 0
    ? media.map((item) => ({
      ...item,
      imageUrl: '/swing-dance-kosice-logo.jpg',
      caption: item.caption ?? 'Swing Dance Kosice',
      source: 'internal' as const,
    }))
    : [
      {
        id: 'logo-only',
        imageUrl: '/swing-dance-kosice-logo.jpg',
        caption: 'Swing Dance Kosice',
        source: 'internal' as const,
      },
    ];

  return (
    <section className="card">
      <h1>{t.gallery.title}</h1>
      <div className="grid grid-2">
        {items.map((item) => (
          <figure key={item.id}>
            <Image
              src={item.imageUrl}
              alt={item.caption ?? t.gallery.imageAlt}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ width: '100%', height: 'auto' }}
            />
            <figcaption className="small">{item.caption}{item.albumTitle ? ` · ${item.albumTitle}` : ''} ({getSourceLabel(locale, item.source)})</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
