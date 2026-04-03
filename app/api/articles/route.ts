import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveArticle } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  status: z.enum(['draft', 'published'])
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await saveArticle({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      content: parsed.data.content,
      status: parsed.data.status,
      createdAt: new Date().toISOString(),
      author: 'Admin'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save article';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
