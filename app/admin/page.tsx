import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <section className="card">
      <h1>Admin panel</h1>
      <p>Správa interného obsahu portálu.</p>
      <div className="grid grid-2">
        <Link href="/admin/articles" className="card">Editor článkov</Link>
        <Link href="/admin/events" className="card">Editor eventov</Link>
        <Link href="/admin/gallery" className="card">Editor galérie</Link>
      </div>
    </section>
  );
}
