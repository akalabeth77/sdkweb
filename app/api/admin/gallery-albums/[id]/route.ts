import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteGalleryAlbum, updateGalleryAlbum } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const schema = z.object({
  title: z.string().min(2),
  sourceType: z.enum(['instagram', 'instagram-embed', 'google-photos', 'google-drive', 'local-folder']),
  sourceRef: z.string().min(1),
  isActive: z.boolean().default(true),
  visibility: z.enum(['public', 'members']).default('public'),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await updateGalleryAlbum(params.id, { ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update gallery album';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteGalleryAlbum(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete gallery album';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
