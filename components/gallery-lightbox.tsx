'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MediaItem } from '@/types';

export function GalleryLightbox({
  items,
  imageAlt,
}: {
  items: (MediaItem & { caption: string })[];
  imageAlt: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const close = useCallback(() => setSelected(null), []);
  const prev = useCallback(() => setSelected((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(() => setSelected((i) => (i !== null && i < items.length - 1 ? i + 1 : i)), [items.length]);

  useEffect(() => {
    if (selected === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, close, prev, next]);

  const canOpen = (item: MediaItem) =>
    item.source !== 'google-photos' && item.source !== 'instagram-embed';

  return (
    <>
      <div className="grid grid-2">
        {items.map((item, idx) => (
          <figure key={item.id}>
            {item.source === 'instagram-embed' ? (
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={item.imageUrl}
                data-instgrm-version="14"
                style={{ margin: '0 auto', width: '100%', maxWidth: '540px' }}
              />
            ) : item.source === 'google-photos' ? (
              <a href={item.linkUrl ?? '#'} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                <Image src={item.imageUrl} alt={item.caption} width={1200} height={900} sizes="(max-width: 768px) 100vw, 50vw" style={{ width: '100%', height: 'auto', cursor: 'pointer' }} />
              </a>
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.caption}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ width: '100%', height: 'auto', cursor: canOpen(item) ? 'zoom-in' : 'default' }}
                onClick={() => canOpen(item) && setSelected(idx)}
              />
            )}
            <figcaption className="small">{item.caption}{item.albumTitle ? ` · ${item.albumTitle}` : ''}</figcaption>
          </figure>
        ))}
      </div>

      {selected !== null && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <button onClick={(e) => { e.stopPropagation(); close(); }} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 36, cursor: 'pointer', lineHeight: 1 }}>×</button>

          {selected > 0 && (
            <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 16, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer' }}>‹</button>
          )}
          {selected < items.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 40, cursor: 'pointer' }}>›</button>
          )}

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src={items[selected].imageUrl}
              alt={items[selected].caption}
              width={1600}
              height={1200}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
            />
            <p style={{ color: '#ccc', marginTop: 12, fontSize: 14 }}>{items[selected].caption}</p>
            <p style={{ color: '#666', fontSize: 12 }}>{selected + 1} / {items.length}</p>
          </div>
        </div>
      )}
    </>
  );
}
