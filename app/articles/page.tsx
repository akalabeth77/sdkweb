import { getArticles } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';

export default async function ArticlesPage() {
  const { locale, t } = getServerMessages();
  const articles = await getArticles();

  return (
    <section className="card">
      <h1>{t.articles.title}</h1>
      {articles.map((article) => (
        <article key={article.id} style={{ marginBottom: '1rem' }}>
          <h3>{article.title}</h3>
          <div className="small">{article.author} · {new Date(article.createdAt).toLocaleString(toDateLocale(locale))} · {getStatusLabel(locale, article.status)}</div>
          <p>{article.content}</p>
        </article>
      ))}
    </section>
  );
}
