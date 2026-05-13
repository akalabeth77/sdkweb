export type UserRole = 'guest' | 'member' | 'editor' | 'admin';

export type EventCategory =
  | 'course'
  | 'dance-party'
  | 'workshop'
  | 'festival'
  | 'concert'
  | 'other';

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  start: string;
  end?: string;
  location?: string;
  registrationUrl?: string;
  source: string;
}

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
  status: 'draft' | 'published';
  views?: number;
}

export interface MediaItem {
  id: string;
  imageUrl: string;
  caption?: string;
  albumTitle?: string;
  source: string;
  linkUrl?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SpotifyPlaylist {
  id: string;
  title: string;
  description?: string;
  spotifyUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
}
