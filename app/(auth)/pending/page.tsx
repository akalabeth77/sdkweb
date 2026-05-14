import Link from 'next/link';

export default function PendingPage() {
  return (
    <section className="card" style={{ maxWidth: 460, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <h1>Účet čaká na schválenie</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Tvoj účet bol vytvorený a čaká na schválenie administrátora.
        Po schválení dostaneš email s potvrdením.
      </p>
      <p className="small" style={{ color: '#888' }}>
        Ak máš otázky, kontaktuj nás na{' '}
        <a href="mailto:info@swingdancekosice.sk">info@swingdancekosice.sk</a>
      </p>
      <Link href="/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#1a1a2e', textDecoration: 'underline', fontSize: '0.9rem' }}>
        Späť na prihlásenie
      </Link>
    </section>
  );
}
