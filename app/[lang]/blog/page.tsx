import Link from 'next/link';
import { safeFetch } from '@/lib/sanity.client';
import { blogQuery } from '@/lib/queries';
import { Locale } from '@/lib/i18n';
import { BlogPost } from '@/types';

export default async function BlogPage({ params }: { params: { lang: Locale } }) {
  const posts: BlogPost[] = await safeFetch<BlogPost[]>(blogQuery, {}, []);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts.map((post) => (
        <article key={post._id} className="card">
          <h2 className="text-2xl font-semibold">{post.title[params.lang]}</h2>
          <p className="text-sm">{post.author?.name}</p>
          <Link href={`/${params.lang}/blog/${post.slug.current}`} className="text-brand">Read more</Link>
        </article>
      ))}
    </section>
  );
}
