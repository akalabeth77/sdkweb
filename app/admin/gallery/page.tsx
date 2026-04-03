'use client';

import { FormEvent, useEffect, useState } from 'react';
import { MediaItem } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/components/language-context';
import { getSourceLabel } from '@/lib/i18n';

type MediaForm = {
  imageUrl: string;
  caption?: string;
};

export default function AdminGalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [message, setMessage] = useState('');
  const { locale, t } = useLanguage();

  async function loadMedia() {
    const response = await fetch('/api/admin/media', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as MediaItem[];
    setMedia(payload);
  }

  useEffect(() => {
    void loadMedia();
  }, []);

  async function createMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: formData.get('imageUrl'),
        caption: formData.get('caption')
      })
    });

    if (response.ok) {
      setMessage(t.admin.galleryCreated);
      event.currentTarget.reset();
      await loadMedia();
      return;
    }

    setMessage(t.admin.galleryCreateError);
  }

  async function updateMedia(id: string, data: MediaForm) {
    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setMessage(t.admin.galleryUpdated);
      await loadMedia();
      return;
    }

    setMessage(t.admin.galleryUpdateError);
  }

  async function deleteMedia(id: string) {
    if (!window.confirm(t.admin.confirmDeleteGallery)) {
      return;
    }

    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMessage(t.admin.galleryDeleted);
      await loadMedia();
      return;
    }

    setMessage(t.admin.galleryDeleteError);
  }

  return (
    <section className="card">
      <h1>{t.admin.galleryTitle}</h1>
      <form onSubmit={createMedia}>
        <label>{t.admin.imageUrl}<input name="imageUrl" type="url" required /></label>
        <label>{t.admin.caption}<input name="caption" /></label>
        <button type="submit">{t.admin.createGalleryItem}</button>
      </form>

      {message ? <p className="small">{message}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.existingGalleryItems}</h2>
      <div className="grid" style={{ gap: '1rem' }}>
        {media.map((item) => (
          <EditableMediaCard
            key={item.id}
            item={item}
            onSave={updateMedia}
            onDelete={deleteMedia}
          />
        ))}
      </div>
    </section>
  );
}

function EditableMediaCard({
  item,
  onSave,
  onDelete,
}: {
  item: MediaItem;
  onSave: (id: string, data: MediaForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [caption, setCaption] = useState(item.caption ?? '');
  const { locale, t } = useLanguage();

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(item.id, {
          imageUrl,
          caption: caption || undefined,
        });
      }}
    >
      <Image
        src={imageUrl}
        alt={caption || t.gallery.imageAlt}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="small">{getSourceLabel(locale, item.source)}</div>
      <label>{t.admin.imageUrl}
        <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} required />
      </label>
      <label>{t.admin.caption}
        <input value={caption} onChange={(event) => setCaption(event.target.value)} />
      </label>
      <button type="submit">{t.common.save}</button>
      <button type="button" onClick={() => void onDelete(item.id)}>{t.common.delete}</button>
    </form>
  );
}
