import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getArticles, saveArticle } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  status: z.enum(['draft', 'published'])
});

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch articles' }, { status: 500 });
  }
}

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save article';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
