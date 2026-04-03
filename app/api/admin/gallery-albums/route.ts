import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getGalleryAlbums, saveGalleryAlbum } from '@/lib/store';

const schema = z.object({
  title: z.string().min(2),
  sourceType: z.enum(['instagram', 'google-drive', 'local-folder']),
  sourceRef: z.string().min(1),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const albums = await getGalleryAlbums();
    return NextResponse.json(albums);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch gallery albums' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await saveGalleryAlbum({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      sourceType: parsed.data.sourceType,
      sourceRef: parsed.data.sourceRef,
      isActive: parsed.data.isActive,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save gallery album';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
