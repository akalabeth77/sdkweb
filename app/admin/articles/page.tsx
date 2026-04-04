'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Article } from '@/types';
import { useLanguage } from '@/components/language-context';
import { getStatusLabel, toDateLocale } from '@/lib/i18n';
import { RichTextEditor } from '@/components/rich-text-editor';

type ArticleForm = {
  title: string;
  content: string;
  status: 'draft' | 'published';
};

function initialEditorValue(value: string): string {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  return `<p>${value.replace(/\n/g, '<br>')}</p>`;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('<p></p>');
  const [createStatus, setCreateStatus] = useState<'draft' | 'published'>('draft');
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

    const response = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: createTitle,
        content: createContent,
        status: createStatus,
      })
    });

    if (response.ok) {
      setMessage(t.admin.articleCreated);
      setCreateTitle('');
      setCreateContent('<p></p>');
      setCreateStatus('draft');
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
        <label>{t.admin.articleTitle}<input name="title" value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} required /></label>
        <label>{t.admin.articleContent}</label>
        <RichTextEditor value={createContent} onChange={setCreateContent} />
        <label>{t.admin.status}
          <select name="status" value={createStatus} onChange={(event) => setCreateStatus(event.target.value as 'draft' | 'published')}>
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
  const [content, setContent] = useState(initialEditorValue(article.content));
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
      </label>
      <RichTextEditor value={content} onChange={setContent} />
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
