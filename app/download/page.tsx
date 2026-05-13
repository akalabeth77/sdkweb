import { getServerMessages } from '@/lib/i18n-server';
import Image from 'next/image';

export default function DownloadPage() {
  const { locale } = getServerMessages();
  const isSk = locale === 'sk';

  return (
    <section className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      <Image
        src="/swing-dance-kosice-logo.jpg"
        alt="KESwing"
        width={160}
        height={160}
        style={{ borderRadius: '24px', marginBottom: '1.5rem' }}
      />
      <h1>KESwing</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {isSk
          ? 'Mobilná appka Swing Dance Košice — eventy, galéria, články a notifikácie priamo v tvojom telefóne.'
          : 'Swing Dance Kosice mobile app — events, gallery, articles and notifications right in your phone.'}
      </p>

      <a
        href="https://github.com/akalabeth77/sdkweb/releases/latest/download/keswing.apk"
        download="KESwing.apk"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#1a1a2e',
          color: '#fff',
          padding: '1rem 2rem',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '1.1rem',
          marginBottom: '1rem',
        }}
      >
        📱 {isSk ? 'Stiahnuť pre Android' : 'Download for Android'}
      </a>

      <p className="small" style={{ color: '#888', marginTop: '1rem' }}>
        {isSk
          ? 'Verzia pre Android. Po stiahnutí povoľ inštaláciu z neznámych zdrojov v Nastaveniach → Bezpečnosť.'
          : 'Android version. After downloading, allow installation from unknown sources in Settings → Security.'}
      </p>

      <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '12px', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>{isSk ? 'Ako nainštalovať:' : 'How to install:'}</h3>
        <ol style={{ paddingLeft: '1.5rem', color: '#444', lineHeight: '2' }}>
          <li>{isSk ? 'Klikni na tlačidlo Stiahnuť' : 'Click the Download button'}</li>
          <li>{isSk ? 'Otvor stiahnutý súbor KESwing.apk' : 'Open the downloaded KESwing.apk file'}</li>
          <li>{isSk ? 'Ak sa zobrazí upozornenie, povol inštaláciu z neznámych zdrojov' : 'If prompted, allow installation from unknown sources'}</li>
          <li>{isSk ? 'Nainštaluj a spusti appku' : 'Install and launch the app'}</li>
        </ol>
      </div>
    </section>
  );
}
