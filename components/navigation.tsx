import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="nav">
      <strong>Swing Portal</strong>
      <Link href="/">Domov</Link>
      <Link href="/events">Eventy</Link>
      <Link href="/gallery">Galéria</Link>
      <Link href="/articles">Články</Link>
      <Link href="/admin">Admin</Link>
      <Link href="/admin/articles">Editor článkov</Link>
      <Link href="/admin/events">Editor eventov</Link>
      <Link href="/admin/gallery">Editor galérie</Link>
      <Link href="/login">Prihlásenie</Link>
    </nav>
  );
}
