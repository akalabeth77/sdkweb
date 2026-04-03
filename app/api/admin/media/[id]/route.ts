import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteInternalMedia, updateInternalMedia } from '@/lib/store';

const schema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional().or(z.literal(''))
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await updateInternalMedia(params.id, {
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update media';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteInternalMedia(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete media';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
