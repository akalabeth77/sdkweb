import { getToken } from './storage';
import type { AppUser, Article, EventItem, MediaItem } from './types';

export type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://sdkweb.vercel.app';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  events: {
    list: () => request<{ events: EventItem[] }>('/api/public/events'),
  },
  articles: {
    list: () => request<{ articles: Article[] }>('/api/public/articles'),
  },
  gallery: {
    list: () => request<{ media: MediaItem[] }>('/api/public/gallery'),
  },
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: AppUser }>('/api/auth/mobile/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, name: string, password: string) =>
      request<{ ok: true }>('/api/auth/mobile/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      }),
  },
  devices: {
    register: (platform: 'android' | 'ios', pushToken: string) =>
      request<{ ok: true }>('/api/mobile/devices', {
        method: 'POST',
        body: JSON.stringify({ platform, pushToken }),
      }),
  },
  admin: {
    events: {
      list: () => request<{ events: EventItem[] }>('/api/mobile/admin/events'),
      create: (data: {
        title: string;
        description?: string;
        category: string;
        start: string;
        end?: string;
        location?: string;
      }) =>
        request<{ ok: true }>('/api/mobile/admin/events', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },
    users: {
      listPending: () => request<{ users: PendingUser[] }>('/api/mobile/admin/users'),
      approve: (id: string) =>
        request<{ ok: true }>(`/api/mobile/admin/users/${id}`, {
          method: 'POST',
          body: JSON.stringify({ action: 'approve' }),
        }),
      reject: (id: string) =>
        request<{ ok: true }>(`/api/mobile/admin/users/${id}`, {
          method: 'POST',
          body: JSON.stringify({ action: 'reject' }),
        }),
    },
  },
};
