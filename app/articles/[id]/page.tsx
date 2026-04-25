import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleByIdentifier, incrementArticleViews } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';
import { normalizeArticleHtml } from '@/lib/article-content';
import { ShareButtons } from '@/components/share-buttons';

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const { locale, t } = getServerMessages();
  const article = await getArticleByIdentifier(params.id);

  if (!article || article.status !== 'published') {
    notFound();
  }

  // Increment view count
  await incrementArticleViews(article.id);

  return (
    <section className="card">
      <Link href="/articles" className="share-link share-btn">{t.articles.backToArticles}</Link>
      <h1 style={{ marginTop: '1rem' }}>{article.title}</h1>
      <div className="small">{article.author} · {new Date(article.createdAt).toLocaleString(toDateLocale(locale))} · {getStatusLabel(locale, article.status)}</div>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.content) }} />
      <ShareButtons
        title={article.title}
        path={`/articles/${encodeURIComponent(article.id)}`}
        anchorId={article.id}
        label={t.articles.shareArticle}
        copyLabel={t.common.copyLink}
        copiedLabel={t.common.copied}
      />
    </section>
  );
}
