import Link from 'next/link';
import { getServerMessages } from '@/lib/i18n-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listPendingUsers } from '@/lib/users';

export default async function AdminDashboardPage() {
  const { t } = getServerMessages();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  const pendingCount = isAdmin ? (await listPendingUsers().catch(() => [])).length : 0;

  return (
    <section className="card">
      <h1>{t.admin.dashboardTitle}</h1>
      <p>{t.admin.dashboardDescription}</p>
      <div className="grid grid-2">
        <Link href="/admin/articles" className="card">{t.nav.articleEditor}</Link>
        <Link href="/admin/events" className="card">{t.nav.eventEditor}</Link>
        <Link href="/admin/gallery" className="card">{t.nav.galleryEditor}</Link>
        {isAdmin ? (
          <Link href="/admin/users" className="card">👥 Používatelia</Link>
        ) : null}
        {isAdmin ? (
          <Link href="/admin/users/approvals" className="card" style={{ position: 'relative' }}>
            ✅ Schvaľovanie účtov
            {pendingCount > 0 ? (
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                background: '#dc2626', color: '#fff', borderRadius: '999px',
                fontSize: '11px', fontWeight: 700, padding: '2px 7px', lineHeight: '1.4',
              }}>
                {pendingCount}
              </span>
            ) : null}
          </Link>
        ) : null}
        <Link href="/admin/push" className="card">📣 Správy / Broadcast</Link>
        <Link href="/admin/music" className="card">🎵 Hudba / Spotify</Link>
      </div>
    </section>
  );
}
