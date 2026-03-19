'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Locale } from '@/lib/i18n';
import type { FacebookPost } from '@/lib/facebook';

type FacebookFeedResponse = {
  posts: FacebookPost[];
  pageUrl?: string;
};

function formatDate(value: string | undefined, lang: Locale) {
  if (!value) return '';
  return new Intl.DateTimeFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function truncateMessage(message: string | undefined) {
  if (!message) return null;
  return message.length > 220 ? `${message.slice(0, 217)}...` : message;
}

export function FacebookFeed({ lang }: { lang: Locale }) {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [pageUrl, setPageUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      try {
        const response = await fetch('/api/facebook/feed');
        if (!response.ok) {
          if (active) setStatus('ready');
          return;
        }

        const data = (await response.json()) as FacebookFeedResponse;
        if (!active) return;
        setPosts(data.posts || []);
        setPageUrl(data.pageUrl);
        setStatus('ready');
      } catch {
        if (active) setStatus('ready');
      }
    }

    void loadFeed();
    return () => {
      active = false;
    };
  }, []);

  const title = lang === 'sk' ? 'Facebook novinky' : 'Facebook updates';
  const emptyText = lang === 'sk' ? 'Facebook feed zatiaľ nie je nakonfigurovaný.' : 'Facebook feed is not configured yet.';
  const loadingText = lang === 'sk' ? 'Načítavam Facebook príspevky…' : 'Loading Facebook posts…';
  const cta = lang === 'sk' ? 'Otvoriť Facebook stránku' : 'Open Facebook page';
  const readMore = lang === 'sk' ? 'Otvoriť príspevok' : 'Open post';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {pageUrl && (
          <Link href={pageUrl} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:border-brand hover:text-brand dark:border-zinc-700">
            {cta}
          </Link>
        )}
      </div>

      {status === 'loading' ? (
        <article className="card">
          <p>{loadingText}</p>
        </article>
      ) : posts.length === 0 ? (
        <article className="card">
          <p>{emptyText}</p>
        </article>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="card flex h-full flex-col gap-4">
              {post.full_picture ? (
                <Image
                  src={post.full_picture}
                  alt="Facebook post"
                  width={640}
                  height={360}
                  className="h-48 w-full rounded-xl object-cover"
                  unoptimized
                />
              ) : null}
              <div className="space-y-3">
                {post.created_time ? <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{formatDate(post.created_time, lang)}</p> : null}
                <p className="text-sm leading-6">{truncateMessage(post.message) || (lang === 'sk' ? 'Príspevok bez textu.' : 'Post without text.')}</p>
              </div>
              {post.permalink_url ? (
                <Link href={post.permalink_url} target="_blank" rel="noreferrer" className="mt-auto text-sm font-medium text-brand underline-offset-4 hover:underline">
                  {readMore}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
