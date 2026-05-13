import { getSpotifyPlaylists } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';

export const revalidate = 900;

function toEmbedUrl(url: string): string {
  return url
    .replace('open.spotify.com/', 'open.spotify.com/embed/')
    .split('?')[0];
}

export default async function MusicPage() {
  const { t } = getServerMessages();
  const playlists = (await getSpotifyPlaylists()).filter((p) => p.isActive);

  return (
    <section className="card">
      <h1>🎵 Hudba</h1>
      {playlists.length === 0 ? (
        <p className="small">Žiadne playlisty zatiaľ nepridané.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {playlists.map((playlist) => (
            <article key={playlist.id}>
              <h2 style={{ marginBottom: '0.5rem' }}>{playlist.title}</h2>
              {playlist.description ? <p className="small" style={{ marginBottom: '0.75rem' }}>{playlist.description}</p> : null}
              <iframe
                src={toEmbedUrl(playlist.spotifyUrl)}
                width="100%"
                height="380"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px', border: 'none' }}
              />
              <a
                href={playlist.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="share-link share-btn"
                style={{ display: 'inline-block', marginTop: '0.5rem' }}
              >
                ▶ Otvoriť v Spotify
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
