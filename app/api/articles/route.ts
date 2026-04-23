import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getArticles } from '@/lib/store';
import { isAuthenticatedSession, isEditorOrAdminSession } from '@/lib/auth-utils';

const createSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  status: z.enum(['draft', 'published']),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional()
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
  // Require authentication for creating articles
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // TODO: Implement saveArticle with new fields
    // await saveArticle(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save article';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
