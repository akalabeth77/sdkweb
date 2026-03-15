import { safeFetch } from '@/lib/sanity.client';
import { galleryQuery } from '@/lib/queries';
import { urlFor } from '@/lib/sanity.image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';

type GalleryItem = {
  _id: string;
  title?: string;
  images?: SanityImageSource[];
};

export default async function GalleryPage() {
  const galleries = await safeFetch<GalleryItem[]>(galleryQuery, {}, []);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Gallery</h1>
      {galleries.map((gallery) => (
        <article key={gallery._id} className="card space-y-3">
          <h2 className="text-xl font-semibold">{gallery.title}</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(gallery.images || []).map((image, idx: number) => (
              <Image
                key={idx}
                src={urlFor(image).width(500).height(300).url()}
                alt="gallery"
                width={500}
                height={300}
                className="h-36 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
