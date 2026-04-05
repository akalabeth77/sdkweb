import Link from 'next/link';
import { getArticles } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';
import { normalizeArticleHtml } from '@/lib/article-content';
import { ShareButtons } from '@/components/share-buttons';

export default async function ArticlesPage() {
  const { locale, t } = getServerMessages();
  const articles = await getArticles();

  return (
    <section className="card">
      <h1>{t.articles.title}</h1>
      {articles.map((article) => (
        <article key={article.id} id={article.id} style={{ marginBottom: '1rem' }}>
          <h3><Link href={`/articles/${encodeURIComponent(article.id)}`}>{article.title}</Link></h3>
          <div className="small">{article.author} · {new Date(article.createdAt).toLocaleString(toDateLocale(locale))} · {getStatusLabel(locale, article.status)}</div>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.content) }}
          />
          <Link href={`/articles/${encodeURIComponent(article.id)}`} className="share-link share-btn">{t.articles.readMore}</Link>
          <ShareButtons
            title={article.title}
            path={`/articles/${encodeURIComponent(article.id)}`}
            anchorId={article.id}
            label={t.articles.shareArticle}
            copyLabel={t.common.copyLink}
            copiedLabel={t.common.copied}
          />
        </article>
      ))}
    </section>
  );
}
