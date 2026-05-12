'use client';

import { FormEvent, useEffect, useState } from 'react';
import { GalleryAlbum, GalleryAlbumSource, MediaItem } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/components/language-context';
import { getSourceLabel } from '@/lib/i18n';

type MediaForm = {
  imageUrl: string;
  caption?: string;
};

type AlbumForm = {
  title: string;
  sourceType: GalleryAlbumSource;
  sourceRef: string;
  isActive: boolean;
};

const SOURCE_TYPE_OPTIONS: { value: GalleryAlbumSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram (account ID + token)' },
  { value: 'instagram-embed', label: 'Instagram Embed (URL postov, bez tokenu)' },
  { value: 'google-photos', label: 'Google Photos (zdieľaný album)' },
  { value: 'google-drive', label: 'Google Drive folder' },
  { value: 'local-folder', label: 'Local folder' },
];

const SOURCE_HINTS: Record<GalleryAlbumSource, string> = {
  instagram: 'Zadaj Instagram Business account ID. Vyžaduje IG_ACCESS_TOKEN v .env.',
  'instagram-embed': 'Vlož URL Instagram postov (jeden na riadok), napr. https://www.instagram.com/p/ABC123/. Nevyžaduje token.',
  'google-photos': 'Vlož URL zdieľaného Google Photos albumu (photos.google.com/share/...). Zobrazí sa ako odkaz v galérii.',
  'google-drive': 'Verejný Google Drive folder URL alebo folder ID. Vyžaduje GOOGLE_DRIVE_API_KEY.',
  'local-folder': 'Relatívna cesta pod LOCAL_GALLERY_ROOT.',
};

export default function AdminGalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [message, setMessage] = useState('');
  const [newAlbumSourceType, setNewAlbumSourceType] = useState<GalleryAlbumSource>('instagram');
  const { locale, t } = useLanguage();

  async function loadMedia() {
    const response = await fetch('/api/admin/media', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as MediaItem[];
    setMedia(payload);
  }

  async function loadAlbums() {
    const response = await fetch('/api/admin/gallery-albums', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json()) as GalleryAlbum[];
    setAlbums(payload);
  }

  useEffect(() => {
    void loadMedia();
    void loadAlbums();
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

  async function createAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/admin/gallery-albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        sourceType: formData.get('sourceType'),
        sourceRef: formData.get('sourceRef'),
        isActive: formData.get('isActive') === 'on',
      })
    });

    if (response.ok) {
      setMessage(t.admin.galleryAlbumCreated);
      event.currentTarget.reset();
      await loadAlbums();
      return;
    }

    setMessage(t.admin.galleryAlbumCreateError);
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

  async function updateAlbum(id: string, data: AlbumForm) {
    const response = await fetch(`/api/admin/gallery-albums/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      setMessage(t.admin.galleryAlbumUpdated);
      await loadAlbums();
      return;
    }

    setMessage(t.admin.galleryAlbumUpdateError);
  }

  async function deleteAlbum(id: string) {
    if (!window.confirm(t.admin.confirmDeleteGalleryAlbum)) {
      return;
    }

    const response = await fetch(`/api/admin/gallery-albums/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMessage(t.admin.galleryAlbumDeleted);
      await loadAlbums();
      return;
    }

    setMessage(t.admin.galleryAlbumDeleteError);
  }

  return (
    <section className="card">
      <h1>{t.admin.galleryTitle}</h1>
      <form onSubmit={createMedia}>
        <label>{t.admin.imageUrl}<input name="imageUrl" type="url" required /></label>
        <label>{t.admin.caption}<input name="caption" /></label>
        <button type="submit">{t.admin.createGalleryItem}</button>
      </form>

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.galleryAlbumsTitle}</h2>
      <form onSubmit={createAlbum}>
        <label>{t.admin.galleryAlbumName}<input name="title" required /></label>
        <label>{t.admin.galleryAlbumType}
          <select
            name="sourceType"
            value={newAlbumSourceType}
            onChange={(e) => setNewAlbumSourceType(e.target.value as GalleryAlbumSource)}
          >
            {SOURCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>{t.admin.galleryAlbumSourceRef}
          {newAlbumSourceType === 'instagram-embed' ? (
            <textarea name="sourceRef" required rows={5} placeholder="https://www.instagram.com/p/ABC123/&#10;https://www.instagram.com/p/DEF456/" style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85em' }} />
          ) : (
            <input name="sourceRef" required />
          )}
        </label>
        <p className="small">{SOURCE_HINTS[newAlbumSourceType]}</p>
        <label><input name="isActive" type="checkbox" defaultChecked /> {t.admin.galleryAlbumActive}</label>
        <button type="submit">{t.admin.createGalleryAlbum}</button>
      </form>

      {message ? <p className="small">{message}</p> : null}

      <h2 style={{ marginTop: '1.5rem' }}>{t.admin.existingGalleryAlbums}</h2>
      <div className="grid" style={{ gap: '1rem' }}>
        {albums.map((album) => (
          <EditableAlbumCard
            key={album.id}
            album={album}
            onSave={updateAlbum}
            onDelete={deleteAlbum}
          />
        ))}
      </div>

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

function EditableAlbumCard({
  album,
  onSave,
  onDelete,
}: {
  album: GalleryAlbum;
  onSave: (id: string, data: AlbumForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(album.title);
  const [sourceType, setSourceType] = useState<GalleryAlbumSource>(album.sourceType);
  const [sourceRef, setSourceRef] = useState(album.sourceRef);
  const [isActive, setIsActive] = useState(album.isActive);
  const { t } = useLanguage();

  return (
    <form
      className="card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave(album.id, { title, sourceType, sourceRef, isActive });
      }}
    >
      <label>{t.admin.galleryAlbumName}
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>{t.admin.galleryAlbumType}
        <select value={sourceType} onChange={(event) => setSourceType(event.target.value as GalleryAlbumSource)}>
          {SOURCE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>{t.admin.galleryAlbumSourceRef}
        {sourceType === 'instagram-embed' ? (
          <textarea value={sourceRef} onChange={(event) => setSourceRef(event.target.value)} required rows={5} style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85em' }} />
        ) : (
          <input value={sourceRef} onChange={(event) => setSourceRef(event.target.value)} required />
        )}
      </label>
      <p className="small">{SOURCE_HINTS[sourceType]}</p>
      <label><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> {t.admin.galleryAlbumActive}</label>
      <button type="submit">{t.common.save}</button>
      <button type="button" onClick={() => void onDelete(album.id)}>{t.common.delete}</button>
    </form>
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
