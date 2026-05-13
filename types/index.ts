export type UserRole = 'guest' | 'member' | 'editor' | 'admin';

export type EventCategory = 'course' | 'dance-party' | 'workshop' | 'festival' | 'concert' | 'other';

export interface Article {
  id: string;
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  author: string;
  featuredImage?: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  status: 'draft' | 'published';
  visibility?: 'public' | 'members';
  views?: number;
  categoryId?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  status: 'registered' | 'waiting' | 'cancelled' | 'attended';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'event';
  isRead: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  platform: 'ios' | 'android' | 'web';
  pushToken: string;
  lastSeenAt: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  category?: EventCategory;
  start: string;
  end?: string;
  location?: string;
  registrationUrl?: string;
  hasRegistrationForm?: boolean;
  recurrenceGroupId?: string;
  source: 'facebook' | 'google' | 'internal' | 'external';
}

export interface MediaItem {
  id: string;
  imageUrl: string;
  caption?: string;
  albumTitle?: string;
  source: 'instagram' | 'facebook' | 'internal' | 'instagram-embed' | 'google-photos';
  linkUrl?: string;
  visibility?: 'public' | 'members';
}

export type GalleryAlbumSource = 'instagram' | 'google-drive' | 'local-folder' | 'instagram-embed' | 'google-photos';

export interface GalleryAlbum {
  id: string;
  title: string;
  sourceType: GalleryAlbumSource;
  sourceRef: string;
  isActive: boolean;
  visibility?: 'public' | 'members';
  createdAt: string;
}
