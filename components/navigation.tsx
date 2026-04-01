import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="nav">
      <strong>Swing Portal</strong>
      <Link href="/">Domov</Link>
      <Link href="/events">Eventy</Link>
      <Link href="/gallery">Galéria</Link>
      <Link href="/articles">Články</Link>
      <Link href="/admin/articles/new">Editor</Link>
      <Link href="/login">Prihlásenie</Link>
    </nav>
  );
}
