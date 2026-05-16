import { fetchPortalData } from '@/lib/social';
import Script from 'next/script';
import { getServerMessages } from '@/lib/i18n-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { GalleryLightbox } from '@/components/gallery-lightbox';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const { t } = getServerMessages();
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  const { media } = await fetchPortalData();

  const visibleItems = media.filter(
    (item) => item.imageUrl && (isLoggedIn || item.visibility !== 'members')
  );

  const lockedCount = media.filter(
    (item) => !isLoggedIn && item.visibility === 'members'
  ).length;

  const items = visibleItems.length > 0
    ? visibleItems.map((item) => ({ ...item, caption: item.caption ?? 'Swing Dance Kosice' }))
    : [{ id: 'logo-only', imageUrl: '/swing-dance-kosice-logo.jpg', caption: 'Swing Dance Kosice', source: 'internal' as const, visibility: 'public' as const }];

  const hasEmbeds = items.some((item) => item.source === 'instagram-embed');

  return (
    <section className="card">
      <h1>{t.gallery.title}</h1>

      {lockedCount > 0 && !isLoggedIn && (
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p className="small">🔒 {lockedCount} {lockedCount === 1 ? 'fotografia je' : 'fotografie sú'} dostupné len pre prihlásených členov. <Link href="/login">Prihláste sa</Link></p>
        </div>
      )}

      {hasEmbeds && (
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      )}

      <GalleryLightbox items={items} imageAlt={t.gallery.imageAlt} />
    </section>
  );
}
