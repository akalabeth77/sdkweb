'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Article } from '@/types';
import { normalizeArticleHtml } from '@/lib/article-content';

export function ArticleSearch({
  articles,
  isLoggedIn,
  locale,
}: {
  articles: Article[];
  isLoggedIn: boolean;
  locale: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || (a.excerpt ?? '').toLowerCase().includes(query.toLowerCase()))
    : articles;

  return (
    <>
      <input
        type="search"
        placeholder={locale === 'sk' ? 'Hľadaj články…' : 'Search articles…'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: '1.5rem', width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
      />

      {filtered.map((article) => {
        const isLocked = article.visibility === 'members' && !isLoggedIn;
        return (
          <article key={article.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <h3>
              {isLocked ? (
                <span style={{ color: '#888' }}>🔒 {article.title}</span>
              ) : (
                <Link href={`/articles/${encodeURIComponent(article.id)}`}>{article.title}</Link>
              )}
            </h3>
            <div className="small">{article.author} · {new Date(article.createdAt).toLocaleDateString(locale === 'sk' ? 'sk-SK' : 'en-US')}</div>
            {isLocked ? (
              <p className="small" style={{ color: '#888', marginTop: '0.5rem' }}>
                Tento článok je dostupný len pre prihlásených členov.{' '}
                <Link href="/login" style={{ color: '#1a1a2e' }}>Prihláste sa</Link>
              </p>
            ) : (
              article.excerpt ? <p style={{ marginTop: '0.5rem', color: '#444' }}>{article.excerpt}</p> : null
            )}
            {!isLocked && (
              <Link href={`/articles/${encodeURIComponent(article.id)}`} className="share-link share-btn" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                {locale === 'sk' ? 'Čítať' : 'Read more'}
              </Link>
            )}
          </article>
        );
      })}

      {filtered.length === 0 && (
        <p className="small">{locale === 'sk' ? 'Žiadne výsledky.' : 'No results.'}</p>
      )}
    </>
  );
}
