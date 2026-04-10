import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/social';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryLabel, toDateLocale } from '@/lib/i18n';
import { DailyQuote } from '@/components/daily-quote';

export const metadata: Metadata = {
  title: 'Swing Dance Kosice - kurzy tanca Lindy Hop Kosice',
  description: 'Kurzy swingoveho tanca v Kosiciach. Nauc sa Lindy Hop, spoznaj komunitu a zazij swingove tanciarne. Zaciatocnici vitani.',
  keywords: [
    'kurzy tanca Kosice',
    'Lindy Hop Kosice',
    'swing dance Kosice',
    'tanecne kurzy pre zaciatocnikov Kosice',
    'Collegiate Shag Kosice',
  ],
};

export default async function HomePage() {
  const { locale } = getServerMessages();
  const dateLocale = toDateLocale(locale);
  const { events, media } = await fetchPortalData();
  const isSk = locale === 'sk';

  const copy = isSk
    ? {
        heroTitle: 'Objav swing v Košiciach',
        heroSubtitle: 'Tanec, komunita a radosť z pohybu',
        ctaStart: 'Začať tancovať',
        ctaParty: 'Najbližšia tančiareň',
        startTitle: 'Ako začať',
        step1Title: '1. Prihlás sa na kurz',
        step1Text: 'Vyber si termín, ktorý ti sedí, a rezervuj si miesto medzi začiatočníkmi.',
        step2Title: '2. Príď na prvú lekciu',
        step2Text: 'Na hodine ťa prevedieme základmi, rytmom a prvými figurami v pohodovej atmosfére.',
        step3Title: '3. Príď na tančiareň',
        step3Text: 'Trénuj v praxi, spoznaj komunitu a uži si večer plný hudby.',
        noPartner: 'Nepotrebuješ partnera',
        beginners: 'Začiatočníci vítaní',
        courses: 'Kurzy',
        level: 'Úroveň',
        signup: 'Prihlásiť sa',
        lindyDesc: 'Energetický partnerský tanec z éry swingu. Ideálny na social dancing aj prvé festivaly.',
        shagDesc: 'Rýchly, hravý a rytmický tanec pre tých, ktorí milujú tempo a zábavu.',
        eventsTitle: 'Najbližšie podujatia / Social dancing',
        joinEvent: 'Zúčastniť sa',
        noEvents: 'Nové podujatia čoskoro pribudnú.',
        communityTitle: 'Komunita',
        communityText1:
          'Nie sme len tanečná škola. Sme komunita ľudí, ktorí sa stretávajú na lekciách, tančiarňach a výletoch.',
        communityText2:
          'Swing u nás znamená priateľstvá, social dancing, spoločné eventy a miesto, kde sa budeš cítiť prirodzene od prvého večera.',
        communityAlt: 'Swing komunita',
        communityCaptionFallback: 'Swing Dance Košice komunita',
        galleryTitle: 'Galéria / Video',
        galleryAlt: 'Swing dance fotografia',
        galleryCaptionFallback: 'Swing Dance Košice',
        faq: 'FAQ',
        faqQ1: 'Potrebujem partnera?',
        faqA1: 'Nepotrebuješ. Na hodinách sa striedame a partnerov meníme.',
        faqQ2: 'Čo si mám obliecť?',
        faqA2: 'Pohodlné oblečenie a čisté topánky. Dôležité je cítiť sa dobre a voľne.',
        faqQ3: 'Je to pre začiatočníkov?',
        faqA3: 'Áno. Kurzy sú pripravené tak, aby si vedel začať aj úplne od nuly.',
        finalTitle: 'Pridaj sa k nám',
        finalText: 'Príď si vyskúšať swing, spoznaj nových ľudí a zaži atmosféru, ktorá ťa chytí.',
        quotesTitle: 'Swing Dance Quotes',
      }
    : {
        heroTitle: 'Discover Swing in Kosice',
        heroSubtitle: 'Dance, community, and joy in motion',
        ctaStart: 'Start Dancing',
        ctaParty: 'Next Social Dance',
        startTitle: 'How to Start',
        step1Title: '1. Sign up for a course',
        step1Text: 'Choose a date that works for you and reserve your place in our beginner group.',
        step2Title: '2. Join your first lesson',
        step2Text: 'We will guide you through basics, rhythm, and your first moves in a friendly space.',
        step3Title: '3. Come to a social dance',
        step3Text: 'Practice in real dancing, meet people, and enjoy an evening full of music.',
        noPartner: 'No partner needed',
        beginners: 'Beginners welcome',
        courses: 'Courses',
        level: 'Level',
        signup: 'Sign Up',
        lindyDesc: 'An energetic partner dance from the swing era. Perfect for social dancing and first festivals.',
        shagDesc: 'Fast, playful, and rhythmic dance for everyone who loves tempo and fun.',
        eventsTitle: 'Upcoming Events / Social Dancing',
        joinEvent: 'Join Event',
        noEvents: 'New events are coming soon.',
        communityTitle: 'Community',
        communityText1:
          'This is not just a dance school. We are a community meeting at classes, socials, and shared trips.',
        communityText2:
          'For us, swing means friendships, social dancing, great events, and a place where you can feel at home from day one.',
        communityAlt: 'Swing community',
        communityCaptionFallback: 'Swing Dance Kosice community',
        galleryTitle: 'Gallery / Video',
        galleryAlt: 'Swing dance photo',
        galleryCaptionFallback: 'Swing Dance Kosice',
        faq: 'FAQ',
        faqQ1: 'Do I need a partner?',
        faqA1: 'No. We rotate partners during classes, so you can join on your own.',
        faqQ2: 'What should I wear?',
        faqA2: 'Wear comfortable clothes and clean shoes. Feeling free to move is what matters.',
        faqQ3: 'Is it for beginners?',
        faqA3: 'Yes. Our classes are designed so you can start from zero.',
        finalTitle: 'Join Us',
        finalText: 'Try swing, meet new people, and experience the atmosphere that keeps people coming back.',
        quotesTitle: 'Swing Dance Quotes',
      };

  const heroImage = '/novy_hero.jpg';
  const sharedSectionImage = '/novy_hero2.jpg';
  const communityPhotos = media.slice(0, 3);
  const galleryPhotos = media.slice(0, 6);

  return (
    <div className="landing-grid">
      <section className="landing-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="landing-hero-overlay">
          <p className="landing-kicker">Swing Dance Košice</p>
          <h1>{copy.heroTitle}</h1>
          <p className="landing-subheadline">{copy.heroSubtitle}</p>
          <div className="landing-actions">
            <Link href="/register" className="landing-btn-primary">{copy.ctaStart}</Link>
            <Link href="/events" className="landing-btn-secondary">{copy.ctaParty}</Link>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>{copy.startTitle}</h2>
        <div className="landing-steps">
          <article>
            <h3>{copy.step1Title}</h3>
            <p>{copy.step1Text}</p>
          </article>
          <article>
            <h3>{copy.step2Title}</h3>
            <p>{copy.step2Text}</p>
          </article>
          <article>
            <h3>{copy.step3Title}</h3>
            <p>{copy.step3Text}</p>
          </article>
        </div>
        <div className="landing-badges">
          <span className="event-badge" style={{ backgroundColor: '#1d4ed8' }}>{copy.noPartner}</span>
          <span className="event-badge" style={{ backgroundColor: '#0f766e' }}>{copy.beginners}</span>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>{copy.courses}</h2>
          <article className="landing-course-card">
            <h3>Lindy Hop</h3>
            <p>{copy.lindyDesc}</p>
            <p className="small">{copy.level}: beginner / intermediate</p>
            <Link href="/register" className="share-link share-btn">{copy.signup}</Link>
          </article>
          <article className="landing-course-card">
            <h3>Collegiate Shag</h3>
            <p>{copy.shagDesc}</p>
            <p className="small">{copy.level}: beginner / intermediate</p>
            <Link href="/register" className="share-link share-btn">{copy.signup}</Link>
          </article>
        </div>
        <div className="card">
          <h2>{copy.eventsTitle}</h2>
          {events.slice(0, 5).map((event) => (
            <article key={event.id} className="landing-event-item">
              <strong>{event.title}</strong>
              <p className="small">
                {new Date(event.start).toLocaleString(dateLocale)} · {getEventCategoryLabel(locale, event.category)}
              </p>
              <Link href="/events" className="share-link share-btn">{copy.joinEvent}</Link>
            </article>
          ))}
          {events.length === 0 ? <p className="small">{copy.noEvents}</p> : null}
        </div>
      </section>

      <section className="card">
        <h2>{copy.communityTitle}</h2>
        <p>{copy.communityText1}</p>
        <p>{copy.communityText2}</p>
        <div className="landing-photo-grid">
          {(communityPhotos.length ? communityPhotos : [{ id: 'fallback', imageUrl: '/swing-dance-kosice-logo.jpg', caption: 'Swing Dance Košice' }]).map((item) => (
            <figure key={item.id}>
              <img src={sharedSectionImage} alt={item.caption ?? copy.communityAlt} loading="lazy" />
              <figcaption className="small">{item.caption ?? copy.communityCaptionFallback}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{copy.galleryTitle}</h2>
        <div className="landing-gallery-grid">
          {(galleryPhotos.length ? galleryPhotos : [{ id: 'logo', imageUrl: '/swing-dance-kosice-logo.jpg', caption: 'Swing Dance Košice' }]).map((item) => (
            <figure key={item.id}>
              <img src={sharedSectionImage} alt={item.caption ?? copy.galleryAlt} loading="lazy" />
              <figcaption className="small">{item.caption ?? copy.galleryCaptionFallback}</figcaption>
            </figure>
          ))}
        </div>
        <div className="landing-video-wrap">
          <iframe
            title="Swing Dance Košice video"
            src="https://www.youtube.com/embed/4g6A5iS7syk"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      <section className="card">
        <h2>{copy.faq}</h2>
        <div className="landing-faq-list">
          <article>
            <h3>{copy.faqQ1}</h3>
            <p>{copy.faqA1}</p>
          </article>
          <article>
            <h3>{copy.faqQ2}</h3>
            <p>{copy.faqA2}</p>
          </article>
          <article>
            <h3>{copy.faqQ3}</h3>
            <p>{copy.faqA3}</p>
          </article>
        </div>
      </section>

      <section className="card landing-final-cta">
        <h2>{copy.finalTitle}</h2>
        <p>{copy.finalText}</p>
        <div className="landing-actions">
          <Link href="/register" className="landing-btn-primary">{copy.ctaStart}</Link>
          <Link href="/events" className="landing-btn-secondary">{copy.ctaParty}</Link>
        </div>
        <div className="community-links-inline" style={{ marginTop: '1rem' }}>
          <a href="https://www.facebook.com/swingdancekosice" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.instagram.com/swingdancekosice" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </section>

      <section className="card">
        <h2>{copy.quotesTitle}</h2>
        <DailyQuote />
      </section>

    </div>
  );
}
