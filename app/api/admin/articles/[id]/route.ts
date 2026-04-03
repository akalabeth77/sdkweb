import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateArticle } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  status: z.enum(['draft', 'published'])
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
    await updateArticle(params.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update article';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
