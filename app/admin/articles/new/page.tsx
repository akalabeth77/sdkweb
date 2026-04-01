'use client';

import { FormEvent, useState } from 'react';

export default function NewArticlePage() {
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        content: formData.get('content'),
        status: formData.get('status')
      })
    });

    if (response.ok) {
      setMessage('Článok bol uložený.');
      (event.currentTarget as HTMLFormElement).reset();
    } else {
      setMessage('Nepodarilo sa uložiť článok.');
    }
  }

  return (
    <section className="card">
      <h1>Editor článkov</h1>
      <form onSubmit={onSubmit}>
        <label>Názov článku<input name="title" required /></label>
        <label>Obsah<textarea name="content" rows={10} required /></label>
        <label>Status
          <select name="status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="submit">Uložiť článok</button>
      </form>
      {message ? <p className="small">{message}</p> : null}
    </section>
  );
}
