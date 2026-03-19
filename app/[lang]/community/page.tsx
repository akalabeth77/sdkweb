import { FacebookFeed } from '@/components/FacebookFeed';
import { Locale } from '@/lib/i18n';
import { communityQuery } from '@/lib/queries';
import { safeFetch } from '@/lib/sanity.client';

export default async function CommunityPage({ params }: { params: { lang: Locale } }) {
  const data = await safeFetch<{ communitySections?: any[] }>(communityQuery, {}, {});
  const sections = data?.communitySections || [];
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{params.lang === 'sk' ? 'Komunita' : 'Community'}</h1>
        <p className="text-zinc-600 dark:text-zinc-300">{params.lang === 'sk' ? 'Novinky zo Sanity a Facebooku na jednom mieste.' : 'Updates from Sanity and Facebook in one place.'}</p>
      </div>

      {sections.map((section: any) => (
        <article key={section._key} className="card">
          <h2 className="text-xl font-semibold">{section.title?.[params.lang]}</h2>
          <p>{section.body?.[params.lang]}</p>
        </article>
      ))}

      <FacebookFeed lang={params.lang} />
    </section>
  );
}
