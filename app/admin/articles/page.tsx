'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Article } from '@/types';

type ArticleForm = {
  title: string;
  content: string;
  status: 'draft' | 'published';
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState('');

  async function loadArticles() {
    const response = await fetch('/api/admin/articles', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as Article[];
    setArticles(payload);
  }

  useEffect(() => {
    void loadArticles();
  }, []);

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        content: formData.get('content'),
        status: formData.get('status')
      })
    });

    if (response.ok) {
      setMessage('Článok bol vytvorený.');
      event.currentTarget.reset();
      await loadArticles();
      return;
    }

    setMessage('Nepodarilo sa vytvoriť článok.');
  }

  async function updateExisting(id: string, data: ArticleForm) {
    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setMessage('Článok bol upravený.');
      await loadArticles();
      return;
    }

    setMessage('Nepodarilo sa upraviť článok.');
  }

  return (
    <section className="card">
      <h1>Editor článkov</h1>
      <form onSubmit={createArticle}>
        <label>Názov článku<input name="title" required /></label>
        <label>Obsah<textarea name="content" rows={8} required /></label>
        <label>Status
          <select name="status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="submit">Pridať článok</button>
      </form>

      {message ? <p className="small">{message}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>Existujúce články</h2>
      <div className="grid" style={{ gap: '1rem' }}>
        {articles.map((article) => (
          <EditableArticleCard key={article.id} article={article} onSave={updateExisting} />
        ))}
      </div>
    </section>
  );
}

function EditableArticleCard({
  article,
  onSave,
}: {
  article: Article;
  onSave: (id: string, data: ArticleForm) => Promise<void>;
}) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [status, setStatus] = useState<'draft' | 'published'>(article.status);

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(article.id, { title, content, status });
      }}
    >
      <div className="small">{new Date(article.createdAt).toLocaleString('sk-SK')}</div>
      <label>Názov
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>Obsah
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} required />
      </label>
      <label>Status
        <select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <button type="submit">Uložiť zmeny</button>
    </form>
  );
}
