import { fetchPortalData } from '@/lib/social';
import Image from 'next/image';
import { getServerMessages } from '@/lib/i18n-server';
import { getSourceLabel } from '@/lib/i18n';

export const revalidate = 900;

export default async function GalleryPage() {
  const { locale, t } = getServerMessages();
  const { media } = await fetchPortalData();

  return (
    <section className="card">
      <h1>{t.gallery.title}</h1>
      <div className="grid grid-2">
        {media.map((item) => (
          <figure key={item.id}>
            <Image
              src={item.imageUrl}
              alt={item.caption ?? t.gallery.imageAlt}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ width: '100%', height: 'auto' }}
            />
            <figcaption className="small">{item.caption} ({getSourceLabel(locale, item.source)})</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
