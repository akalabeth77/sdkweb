import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://swingdancekosice.vercel.app';
  const paths = ['', '/events', '/courses', '/syllabus', '/teachers', '/blog', '/gallery', '/community'];
  return ['sk', 'en'].flatMap((lang) => paths.map((path) => ({ url: `${base}/${lang}${path}`, changeFrequency: 'weekly' as const })));
}
