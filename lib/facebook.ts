import 'server-only';

import { cache } from 'react';

export type FacebookPost = {
  id: string;
  message?: string;
  permalink_url?: string;
  created_time?: string;
  full_picture?: string;
};

type FacebookFeedResponse = {
  data?: FacebookPost[];
};

type FacebookPageAccount = {
  id: string;
  link?: string;
  access_token?: string;
};

type FacebookAccountsResponse = {
  data?: FacebookPageAccount[];
};

async function fetchJson<T>(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) {
      console.warn('Facebook request failed.', response.status, response.statusText);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn('Facebook request failed.', error);
    return null;
  }
}

const resolveFacebookConfig = cache(async () => {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const configuredPageId = process.env.FACEBOOK_PAGE_ID;
  const configuredPageUrl = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL;

  if (!accessToken) {
    return { accessToken: '', pageId: '', pageUrl: configuredPageUrl };
  }

  if (configuredPageId) {
    return { accessToken, pageId: configuredPageId, pageUrl: configuredPageUrl };
  }

  const searchParams = new URLSearchParams({
    access_token: accessToken,
    fields: 'id,link,access_token',
    limit: '1'
  });

  const accounts = await fetchJson<FacebookAccountsResponse>(`https://graph.facebook.com/v19.0/me/accounts?${searchParams.toString()}`);
  const page = accounts?.data?.[0];

  return {
    accessToken: page?.access_token || accessToken,
    pageId: page?.id || '',
    pageUrl: configuredPageUrl || page?.link
  };
});

export async function getFacebookPageUrl() {
  const { pageUrl } = await resolveFacebookConfig();
  return pageUrl;
}

export async function getFacebookPosts(limit = 3): Promise<FacebookPost[]> {
  const { accessToken, pageId } = await resolveFacebookConfig();
  if (!accessToken || !pageId) return [];

  const searchParams = new URLSearchParams({
    access_token: accessToken,
    fields: 'id,message,permalink_url,created_time,full_picture',
    limit: String(limit)
  });

  const payload = await fetchJson<FacebookFeedResponse>(`https://graph.facebook.com/v19.0/${pageId}/posts?${searchParams.toString()}`);
  return payload?.data ?? [];
}
