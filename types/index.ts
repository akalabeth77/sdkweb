export type UserRole = 'guest' | 'member' | 'editor' | 'admin';

export type EventCategory = 'course' | 'dance-party' | 'workshop' | 'festival' | 'concert' | 'other';

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status: 'draft' | 'published';
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  category?: EventCategory;
  start: string;
  end?: string;
  location?: string;
  recurrenceGroupId?: string;
  source: 'facebook' | 'google' | 'internal' | 'external';
}

export interface MediaItem {
  id: string;
  imageUrl: string;
  caption?: string;
  albumTitle?: string;
  source: 'instagram' | 'facebook' | 'internal';
}

export type GalleryAlbumSource = 'instagram' | 'google-drive' | 'local-folder';

export interface GalleryAlbum {
  id: string;
  title: string;
  sourceType: GalleryAlbumSource;
  sourceRef: string;
  isActive: boolean;
  createdAt: string;
}
