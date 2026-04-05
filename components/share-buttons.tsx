'use client';

import { useState } from 'react';

type Props = {
  title: string;
  text?: string;
  path: string;
  anchorId: string;
  label: string;
  copyLabel: string;
  copiedLabel: string;
};

function buildShareUrl(path: string, anchorId: string) {
  if (typeof window === 'undefined') {
    return `${path}#${anchorId}`;
  }

  return `${window.location.origin}${path}#${anchorId}`;
}

export function ShareButtons({ title, text, path, anchorId, label, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildShareUrl(path, anchorId);
  const shareText = text ? `${title} - ${text}` : title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    await navigator.share({
      title,
      text,
      url: shareUrl,
    });
  }

  return (
    <div className="share-row" aria-label={label}>
      <button type="button" className="share-btn" onClick={() => void nativeShare()}>{label}</button>
      <a className="share-btn share-link" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a>
      <a className="share-btn share-link" href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a>
      <a className="share-btn share-link" href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer">X</a>
      <button type="button" className="share-btn" onClick={() => void copyLink()}>{copied ? copiedLabel : copyLabel}</button>
    </div>
  );
}
