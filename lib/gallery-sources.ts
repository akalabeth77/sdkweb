import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { GalleryAlbum, MediaItem } from '@/types';

function normalizeFolderId(sourceRef: string): string | null {
  const trimmed = sourceRef.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

async function fetchInstagramAlbumMedia(album: GalleryAlbum): Promise<MediaItem[]> {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    return [];
  }

  const accountId = album.sourceRef.trim();
  if (!accountId) {
    return [];
  }

  const url = `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_url,thumbnail_url&access_token=${token}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.data ?? [])
    .map((item: any) => ({
      id: `alb-ig-${album.id}-${item.id}`,
      imageUrl: item.media_url ?? item.thumbnail_url,
      caption: item.caption,
      albumTitle: album.title,
      source: 'instagram',
      visibility: album.visibility,
    } satisfies MediaItem))
    .filter((item: MediaItem) => Boolean(item.imageUrl));
}

async function fetchGoogleDriveAlbumMedia(album: GalleryAlbum): Promise<MediaItem[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const folderId = normalizeFolderId(album.sourceRef);
  if (!apiKey || !folderId) {
    return [];
  }

  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.files ?? [])
    .filter((file: any) => typeof file.mimeType === 'string' && file.mimeType.startsWith('image/'))
    .map((file: any) => ({
      id: `alb-gd-${album.id}-${file.id}`,
      imageUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
      caption: file.name,
      albumTitle: album.title,
      source: 'internal',
      visibility: album.visibility,
    } satisfies MediaItem));
}

async function fetchLocalFolderAlbumMedia(album: GalleryAlbum): Promise<MediaItem[]> {
  const root = process.env.LOCAL_GALLERY_ROOT;
  if (!root) {
    return [];
  }

  const resolvedRoot = path.resolve(root);
  const targetDir = path.resolve(resolvedRoot, album.sourceRef);
  if (!targetDir.startsWith(resolvedRoot)) {
    return [];
  }

  try {
    const files = await readdir(targetDir, { withFileTypes: true });
    return files
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|gif)$/i.test(entry.name))
      .map((entry) => {
        const relativePath = path.relative(resolvedRoot, path.join(targetDir, entry.name)).replaceAll('\\', '/');
        return {
          id: `alb-local-${album.id}-${entry.name}`,
          imageUrl: `/api/gallery/local-file?path=${encodeURIComponent(relativePath)}`,
          caption: entry.name,
          albumTitle: album.title,
          source: 'internal',
          visibility: album.visibility,
        } satisfies MediaItem;
      });
  } catch {
    return [];
  }
}

async function fetchGooglePhotosAlbumMedia(album: GalleryAlbum): Promise<MediaItem[]> {
  const albumUrl = album.sourceRef.trim();
  if (!albumUrl.startsWith('https://photos.google.com/')) return [];

  let thumbnailUrl: string | null = null;

  try {
    const res = await fetch(albumUrl, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (res.ok) {
      const html = await res.text();
      // og:image is always a photo (never video) and server-rendered
      const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
                 ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
      if (match?.[1]?.startsWith('https://lh3.googleusercontent.com')) {
        // Strip existing size params and set our own
        thumbnailUrl = match[1].replace(/=w\d+.*$/, '') + '=w1200-h900';
      }
    }
  } catch {
    // fetch failed — show link card without thumbnail
  }

  if (!thumbnailUrl) {
    return [];
  }

  return [{
    id: `alb-gp-${album.id}`,
    imageUrl: thumbnailUrl,
    caption: album.title,
    albumTitle: album.title,
    source: 'google-photos' as const,
    linkUrl: albumUrl,
    visibility: album.visibility,
  }];
}

const IG_POST_RE = /^https:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?/;

function fetchInstagramEmbedAlbumMedia(album: GalleryAlbum): MediaItem[] {
  return album.sourceRef
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => IG_POST_RE.test(line))
    .map((url, index) => ({
      id: `alb-ig-embed-${album.id}-${index}`,
      imageUrl: url,
      caption: album.title,
      albumTitle: album.title,
      source: 'instagram-embed' as const,
      visibility: album.visibility,
    }));
}

export async function fetchAlbumMedia(album: GalleryAlbum): Promise<MediaItem[]> {
  if (!album.isActive) {
    return [];
  }

  if (album.sourceType === 'instagram') {
    return fetchInstagramAlbumMedia(album);
  }

  if (album.sourceType === 'instagram-embed') {
    return fetchInstagramEmbedAlbumMedia(album);
  }

  if (album.sourceType === 'google-photos') {
    return await fetchGooglePhotosAlbumMedia(album);
  }

  if (album.sourceType === 'google-drive') {
    return fetchGoogleDriveAlbumMedia(album);
  }

  if (album.sourceType === 'local-folder') {
    return fetchLocalFolderAlbumMedia(album);
  }

  return [];
}
