import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getGalleryAlbums, saveGalleryAlbum } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const schema = z.object({
  title: z.string().min(2),
  sourceType: z.enum(['instagram', 'instagram-embed', 'google-photos', 'google-drive', 'local-folder']),
  sourceRef: z.string().min(1),
  isActive: z.boolean().default(true),
  visibility: z.enum(['public', 'members']).default('public'),
});

export async function GET() {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const albums = await getGalleryAlbums();
    return NextResponse.json(albums);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch gallery albums' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      visibility: parsed.data.visibility,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[gallery-albums POST]', message);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
