import { client } from '@/lib/sanity.client';
import { communityQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';

export default async function CommunityPage({ params }: { params: { lang: Locale } }) {
  const data = await client.fetch(communityQuery);
  const sections = data?.communitySections || [];
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{params.lang === 'sk' ? 'Komunita' : 'Community'}</h1>
      {sections.map((section: any) => (
        <article key={section._key} className="card">
          <h2 className="text-xl font-semibold">{section.title?.[params.lang]}</h2>
          <p>{section.body?.[params.lang]}</p>
        </article>
      ))}
    </section>
  );
}
