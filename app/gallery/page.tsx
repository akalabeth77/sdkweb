import { fetchPortalData } from '@/lib/social';
import Script from 'next/script';
import { getServerMessages } from '@/lib/i18n-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { GalleryLightbox } from '@/components/gallery-lightbox';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const { t } = getServerMessages();
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  const { media, albums } = await fetchPortalData();

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

  // Albums visible to current user, with an external link
  const visibleAlbums = albums.filter(
    (a) => a.sourceRef && (isLoggedIn || a.visibility !== 'members')
  );

  // Thumbnail scraped for google-photos albums (from media items)
  const albumThumbnails = new Map<string, string>();
  for (const item of media) {
    if (item.source === 'google-photos' && item.imageUrl) {
      // id format: alb-gp-{albumId}
      const match = item.id.match(/^alb-gp-(.+)$/);
      if (match?.[1]) albumThumbnails.set(match[1], item.imageUrl);
    }
  }

  const albumsWithLink = visibleAlbums.filter(a =>
    a.sourceType === 'google-photos' || a.sourceType === 'google-drive' || a.sourceType === 'instagram'
  );

  return (
    <section className="card">
      <h1>{t.gallery.title}</h1>

      {lockedCount > 0 && !isLoggedIn && (
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p className="small">🔒 {lockedCount} {lockedCount === 1 ? 'fotografia je' : 'fotografie sú'} dostupné len pre prihlásených členov. <Link href="/login">Prihláste sa</Link></p>
        </div>
      )}

      {albumsWithLink.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#444' }}>Fotoalbumy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {albumsWithLink.map(album => {
              const thumb = albumThumbnails.get(album.id);
              return (
                <a
                  key={album.id}
                  href={album.sourceRef}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', borderRadius: '10px', overflow: 'hidden', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                >
                  <div style={{ position: 'relative', paddingBottom: '66%', background: '#1a1a2e', overflow: 'hidden' }}>
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={album.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 250px"
                        style={{ objectFit: 'cover', opacity: 0.85 }}
                      />
                    ) : null}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0.75rem', background: thumb ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' : 'none' }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>{album.title}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '2px' }}>
                        {album.sourceType === 'google-photos' ? '📷 Google Photos' : album.sourceType === 'google-drive' ? '📁 Google Drive' : '📸 Instagram'} ↗
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {hasEmbeds && (
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      )}

      <GalleryLightbox items={items} imageAlt={t.gallery.imageAlt} />
    </section>
  );
}
