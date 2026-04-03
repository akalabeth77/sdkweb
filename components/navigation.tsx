import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function Navigation() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="nav">
      <strong>Swing Portal</strong>
      <Link href="/">Domov</Link>
      <Link href="/events">Eventy</Link>
      <Link href="/gallery">Galéria</Link>
      <Link href="/articles">Články</Link>
      {session?.user ? (
        <>
          <Link href="/admin">Admin</Link>
          <Link href="/admin/articles">Editor článkov</Link>
          <Link href="/admin/events">Editor eventov</Link>
          <Link href="/admin/gallery">Editor galérie</Link>
          <Link href="/api/auth/signout">Odhlásenie</Link>
        </>
      ) : (
        <Link href="/login">Prihlásenie</Link>
      )}
    </nav>
  );
}
