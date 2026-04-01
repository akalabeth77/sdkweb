export type UserRole = 'guest' | 'member' | 'editor' | 'admin';

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
  start: string;
  end?: string;
  location?: string;
  source: 'facebook' | 'google' | 'internal';
}

export interface MediaItem {
  id: string;
  imageUrl: string;
  caption?: string;
  source: 'instagram' | 'facebook' | 'internal';
}
