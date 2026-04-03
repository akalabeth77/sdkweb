import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInternalMedia, saveInternalMedia } from '@/lib/store';

const schema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional().or(z.literal(''))
});

export async function GET() {
  try {
    const media = await getInternalMedia();
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch media' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await saveInternalMedia({
      id: crypto.randomUUID(),
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save media';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
