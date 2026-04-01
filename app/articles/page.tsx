import { getArticles } from '@/lib/store';

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <section className="card">
      <h1>Články</h1>
      {articles.map((article) => (
        <article key={article.id} style={{ marginBottom: '1rem' }}>
          <h3>{article.title}</h3>
          <div className="small">{article.author} · {new Date(article.createdAt).toLocaleString('sk-SK')} · {article.status}</div>
          <p>{article.content}</p>
        </article>
      ))}
    </section>
  );
}
