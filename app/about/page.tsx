import type { Metadata } from 'next';
import { getServerMessages } from '@/lib/i18n-server';
import { CommunityLinks } from '@/components/community-links';

export const metadata: Metadata = {
  title: 'O nas - Swing Dance Kosice',
  description: 'Swing Dance Kosice je komunita pre milovnikov Lindy Hopu a swingu. Kurzy, tanciarne, workshopy a priatelska atmosfera v Kosiciach.',
};

export default function AboutPage() {
  const { locale, t } = getServerMessages();

  return (
    <div className="grid" style={{ gap: '1.2rem' }}>
      <section className="card">
        <h1>{t.about.title}</h1>
        <p>{t.about.intro}</p>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>{t.about.missionTitle}</h2>
          <p>{t.about.missionText}</p>
        </article>
        <article className="card">
          <h2>{t.about.coursesTitle}</h2>
          <p>{t.about.courses}</p>
        </article>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>{t.about.eventsTitle}</h2>
          <p>{t.about.events}</p>
        </article>
        <article className="card">
          <h2>{t.about.whyTitle}</h2>
          <p>{t.about.why}</p>
        </article>
      </section>

      <section className="card">
        <h2>{t.about.joinTitle}</h2>
        <p>{t.about.join}</p>
      </section>

      <section className="card">
        <CommunityLinks locale={locale} title={t.footer.contactTitle} logoSize={180} />
      </section>
    </div>
  );
}
