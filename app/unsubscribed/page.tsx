import Link from 'next/link';

export default function UnsubscribedPage({ searchParams }: { searchParams: { error?: string } }) {
  const isError = searchParams.error === '1';

  return (
    <section className="card" style={{ maxWidth: 460, textAlign: 'center' }}>
      {isError ? (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1>Neplatný odkaz</h1>
          <p style={{ color: '#555' }}>
            Odkaz na odhlásenie je neplatný alebo vypršal. Emailové notifikácie môžeš spravovať
            v nastaveniach profilu.
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h1>Odhlásený z emailov</h1>
          <p style={{ color: '#555' }}>
            Úspešne si sa odhlásil z emailových notifikácií Swing Dance Košice.
            Emailové notifikácie môžeš kedykoľvek znova zapnúť v nastaveniach profilu.
          </p>
        </>
      )}
      <Link
        href="/profile/settings"
        style={{ display: 'inline-block', marginTop: '1.5rem', color: '#1a1a2e', textDecoration: 'underline', fontSize: '0.9rem' }}
      >
        Nastavenia notifikácií
      </Link>
    </section>
  );
}
