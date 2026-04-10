import { EventItem, MediaItem } from '@/types';
import { getGalleryAlbums, getInternalEvents, getInternalMedia } from './store';
import { fetchAlbumMedia } from './gallery-sources';

const fallbackEvents: EventItem[] = [];

const fallbackMedia: MediaItem[] = [
  {
    id: 'm1',
    imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ukážková swing fotografia',
    source: 'internal'
  }
];

export async function fetchFacebookEvents(): Promise<EventItem[]> {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_ACCESS_TOKEN;

  if (!pageId || !token) return [];

  const url = `https://graph.facebook.com/v19.0/${pageId}/events?fields=id,name,start_time,end_time,place&access_token=${token}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.data ?? []).map((item: any) => ({
    id: `fb-${item.id}`,
    title: item.name,
    start: item.start_time,
    end: item.end_time,
    location: item.place?.name,
    source: 'facebook'
  } satisfies EventItem));
}

export async function fetchInstagramMedia(): Promise<MediaItem[]> {
  const accountId = process.env.IG_ACCOUNT_ID;
  const token = process.env.IG_ACCESS_TOKEN;

  if (!accountId || !token) return [];

  const url = `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_url,thumbnail_url&access_token=${token}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.data ?? []).map((item: any) => ({
    id: `ig-${item.id}`,
    imageUrl: item.media_url ?? item.thumbnail_url,
    caption: item.caption,
    source: 'instagram'
  } satisfies MediaItem)).filter((m: MediaItem) => !!m.imageUrl);
}

export async function fetchGoogleCalendarEvents(): Promise<EventItem[]> {
  const calendarId = process.env.GCAL_CALENDAR_ID;
  const apiKey = process.env.GCAL_API_KEY;
  if (!calendarId || !apiKey) return [];

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(new Date().toISOString())}&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    id: `gcal-${item.id}`,
    title: item.summary,
    start: item.start?.dateTime ?? item.start?.date,
    end: item.end?.dateTime ?? item.end?.date,
    location: item.location,
    source: 'google'
  } satisfies EventItem));
}

export async function fetchPortalData() {
  const [fbEventsResult, igMediaResult, gEventsResult, internalEventsResult, internalMediaResult, albumsResult] = await Promise.allSettled([
    fetchFacebookEvents(),
    fetchInstagramMedia(),
    fetchGoogleCalendarEvents(),
    getInternalEvents(),
    getInternalMedia(),
    getGalleryAlbums(),
  ]);

  const fbEvents = fbEventsResult.status === 'fulfilled' ? fbEventsResult.value : [];
  const igMedia = igMediaResult.status === 'fulfilled' ? igMediaResult.value : [];
  const gEvents = gEventsResult.status === 'fulfilled' ? gEventsResult.value : [];
  const internalEvents = internalEventsResult.status === 'fulfilled' ? internalEventsResult.value : [];
  const internalMedia = internalMediaResult.status === 'fulfilled' ? internalMediaResult.value : [];
  const albums = albumsResult.status === 'fulfilled' ? albumsResult.value : [];

  const albumMedia = (
    await Promise.all(
      albums.map(async (album) => {
        try {
          return await fetchAlbumMedia(album);
        } catch {
          return [];
        }
      })
    )
  ).flat();

  return {
    events: [...fbEvents, ...gEvents, ...internalEvents, ...fallbackEvents]
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 20),
    media: [...internalMedia, ...albumMedia, ...igMedia, ...fallbackMedia].slice(0, 24)
  };
}
