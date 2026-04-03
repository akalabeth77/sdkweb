'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Article } from '@/types';
import { useLanguage } from '@/components/language-context';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';

type ArticleForm = {
  title: string;
  content: string;
  status: 'draft' | 'published';
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState('');
  const { locale, t } = useLanguage();

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
      setMessage(t.admin.articleCreated);
      event.currentTarget.reset();
      await loadArticles();
      return;
    }

    setMessage(t.admin.articleCreateError);
  }

  async function updateExisting(id: string, data: ArticleForm) {
    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setMessage(t.admin.articleUpdated);
      await loadArticles();
      return;
    }

    setMessage(t.admin.articleUpdateError);
  }

  async function deleteExisting(id: string) {
    if (!window.confirm(t.admin.confirmDeleteArticle)) {
      return;
    }

    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMessage(t.admin.articleDeleted);
      await loadArticles();
      return;
    }

    setMessage(t.admin.articleDeleteError);
  }

  return (
    <section className="card">
      <h1>{t.admin.articlesTitle}</h1>
      <form onSubmit={createArticle}>
        <label>{t.admin.articleTitle}<input name="title" required /></label>
        <label>{t.admin.articleContent}<textarea name="content" rows={8} required /></label>
        <label>{t.admin.status}
          <select name="status" defaultValue="draft">
            <option value="draft">{t.common.draft}</option>
            <option value="published">{t.common.published}</option>
          </select>
        </label>
        <button type="submit">{t.admin.createArticle}</button>
      </form>

      {message ? <p className="small">{message}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.existingArticles}</h2>
      <div className="grid" style={{ gap: '1rem' }}>
        {articles.map((article) => (
          <EditableArticleCard
            key={article.id}
            article={article}
            onSave={updateExisting}
            onDelete={deleteExisting}
          />
        ))}
      </div>
    </section>
  );
}

function EditableArticleCard({
  article,
  onSave,
  onDelete,
}: {
  article: Article;
  onSave: (id: string, data: ArticleForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [status, setStatus] = useState<'draft' | 'published'>(article.status);
  const { locale, t } = useLanguage();

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(article.id, { title, content, status });
      }}
    >
      <div className="small">{new Date(article.createdAt).toLocaleString(toDateLocale(locale))} · {getStatusLabel(locale, article.status)}</div>
      <label>{t.admin.articleTitle}
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>{t.admin.articleContent}
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} required />
      </label>
      <label>{t.admin.status}
        <select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}>
          <option value="draft">{t.common.draft}</option>
          <option value="published">{t.common.published}</option>
        </select>
      </label>
      <button type="submit">{t.common.save}</button>
      <button type="button" onClick={() => void onDelete(article.id)}>{t.common.delete}</button>
    </form>
  );
}
