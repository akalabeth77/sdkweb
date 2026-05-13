import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getArticles, saveArticle } from '@/lib/store';
import { extractPlainText, normalizeArticleHtml } from '@/lib/article-content';
import { isEditorOrAdminSession } from '@/lib/auth-utils';
import { notifyNewArticle } from '@/lib/email';

const createSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional()
});

export async function GET() {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedContent = normalizeArticleHtml(parsed.data.content);
  const plainText = extractPlainText(normalizedContent);
  if (plainText.length < 10) {
    return NextResponse.json({ error: 'Article content is too short.' }, { status: 400 });
  }

  try {
    await saveArticle({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      content: normalizedContent,
      status: parsed.data.status,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      featuredImage: parsed.data.featuredImage,
      categoryId: parsed.data.categoryId,
      publishedAt: parsed.data.status === 'published' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      author: 'Admin' // TODO: Get from session
    });

    if (parsed.data.status === 'published') {
      const slug = parsed.data.slug ?? parsed.data.title.toLowerCase().replace(/\s+/g, '-');
      void notifyNewArticle(parsed.data.title, slug);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save article';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
