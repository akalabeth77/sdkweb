"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export function Navigation() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <nav className="nav">
      <strong>Swing Portal</strong>
      <Link href="/">Domov</Link>
      <Link href="/events">Eventy</Link>
      <Link href="/gallery">Galéria</Link>
      <Link href="/articles">Články</Link>
      {isAuthenticated ? (
        <>
          <Link href="/admin">Admin</Link>
          <Link href="/admin/articles">Editor článkov</Link>
          <Link href="/admin/events">Editor eventov</Link>
          <Link href="/admin/gallery">Editor galérie</Link>
          <button type="button" onClick={() => void signOut({ callbackUrl: '/' })}>Odhlásenie</button>
        </>
      ) : (
        <Link href="/login">Prihlásenie</Link>
      )}
    </nav>
  );
}
