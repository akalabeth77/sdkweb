"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LanguageSwitcher } from './language-switcher';
import { useLanguage } from './language-context';

export function Navigation() {
  const { status, data } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = data?.user?.role === 'admin';
  const userName = data?.user?.name || data?.user?.email;
  const { t } = useLanguage();

  return (
    <nav className="nav">
      <strong>{t.brand}</strong>
      <Link href="/">{t.nav.home}</Link>
      <Link href="/about">{t.nav.about}</Link>
      <Link href="/events">{t.nav.events}</Link>
      <Link href="/gallery">{t.nav.gallery}</Link>
      <Link href="/articles">{t.nav.articles}</Link>
      {isAuthenticated ? (
        <>
          <span style={{ fontSize: '0.9rem', color: '#666', opacity: 0.8 }}>👤 {userName}</span>
          <Link href="/admin">{t.nav.admin}</Link>
          <Link href="/admin/articles">{t.nav.articleEditor}</Link>
          <Link href="/admin/events">{t.nav.eventEditor}</Link>
          <Link href="/admin/gallery">{t.nav.galleryEditor}</Link>
          {isAdmin ? <Link href="/admin/users">{t.nav.userApproval}</Link> : null}
          <button type="button" onClick={() => void signOut({ callbackUrl: '/' })}>{t.nav.logout}</button>
        </>
      ) : (
        <>
          <Link href="/login">{t.nav.login}</Link>
          <Link href="/register">{t.nav.register}</Link>
        </>
      )}
      <LanguageSwitcher />
    </nav>
  );
}
