import { client } from '@/lib/sanity.client';
import { teachersQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';
import { Teacher } from '@/types';
import { urlFor } from '@/lib/sanity.image';
import Image from 'next/image';

export default async function TeachersPage({ params }: { params: { lang: Locale } }) {
  const teachers: Teacher[] = await client.fetch(teachersQuery);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{params.lang === 'sk' ? 'Lektori' : 'Teachers'}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {teachers.map((teacher) => (
          <article key={teacher._id} className="card space-y-2">
            {teacher.photo ? (
              <Image
                src={urlFor(teacher.photo).width(500).height(320).url()}
                alt={teacher.name}
                width={500}
                height={320}
                className="h-48 w-full rounded-xl object-cover"
              />
            ) : null}
            <h2 className="text-xl font-semibold">{teacher.name}</h2>
            <p className="text-sm">{teacher.bio?.[params.lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
