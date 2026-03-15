import { createClient } from 'next-sanity';

let hasLoggedSanityFetchWarning = false;

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-07-01',
  useCdn: true
});

export async function safeFetch<T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> {
  try {
    return await client.fetch<T>(query, params);
  } catch {
    if (!hasLoggedSanityFetchWarning) {
      console.warn('Sanity fetch failed during build/runtime. Returning fallback data.');
      hasLoggedSanityFetchWarning = true;
    }
    return fallback;
  }
}
