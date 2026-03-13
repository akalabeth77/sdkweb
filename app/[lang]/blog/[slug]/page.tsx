import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity.client';
import { blogBySlugQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';

export default async function BlogDetail({ params }: { params: { lang: Locale; slug: string } }) {
  const post = await client.fetch(blogBySlugQuery, { slug: params.slug });
  return (
    <article className="prose dark:prose-invert">
      <h1>{post?.title?.[params.lang]}</h1>
      <PortableText value={post?.content || []} />
    </article>
  );
}
