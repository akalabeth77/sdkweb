import { fetchPortalData } from '@/lib/social';

export const revalidate = 900;

export default async function GalleryPage() {
  const { media } = await fetchPortalData();

  return (
    <section className="card">
      <h1>Galéria</h1>
      <div className="grid grid-2">
        {media.map((item) => (
          <figure key={item.id}>
            <img src={item.imageUrl} alt={item.caption ?? 'Swing photo'} />
            <figcaption className="small">{item.caption} ({item.source})</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
