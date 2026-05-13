import Link from 'next/link';
import { getArticles, getTopArticles } from '@/lib/store';
import { getServerMessages } from '@/lib/i18n-server';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleSearch } from '@/components/article-search';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const { locale, t } = getServerMessages();
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  const [allArticles, topArticles] = await Promise.all([
    getArticles(),
    getTopArticles(5),
  ]);

  const published = allArticles.filter((a) => a.status === 'published');

  return (
    <section className="card">
      <h1>{t.articles.title}</h1>

      {topArticles.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f5f5f5' }}>
          <h2>Najčítanejšie / Most Read</h2>
          <ol style={{ paddingLeft: '1.5rem' }}>
            {topArticles.map((article) => (
              <li key={article.id} style={{ marginBottom: '0.5rem' }}>
                {article.visibility === 'members' && !isLoggedIn ? (
                  <span style={{ color: '#888' }}>🔒 {article.title}</span>
                ) : (
                  <Link href={`/articles/${encodeURIComponent(article.id)}`}>{article.title}</Link>
                )}
                <span className="small"> ({article.views ?? 0} {locale === 'sk' ? 'zobrazení' : 'views'})</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <ArticleSearch articles={published} isLoggedIn={isLoggedIn} locale={locale} />
    </section>
  );
}
