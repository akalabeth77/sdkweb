import { client } from '@/lib/sanity.client';
import { syllabusQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';

export default async function SyllabusPage({ params }: { params: { lang: Locale } }) {
  const levels = await client.fetch(syllabusQuery);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Collegiate Shag Syllabus</h1>
      {levels.map((level: any) => (
        <article key={level._id} className="card space-y-2">
          <h2 className="text-2xl font-semibold capitalize">{level.level}</h2>
          <p>{level.description?.[params.lang]}</p>
          <ul className="list-disc pl-5">{(level.skills || []).map((skill: string) => <li key={skill}>{skill}</li>)}</ul>
          {(level.videos || []).map((video: string) => <iframe key={video} src={video} className="h-60 w-full rounded-xl" />)}
        </article>
      ))}
    </section>
  );
}
