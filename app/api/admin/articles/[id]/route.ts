import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteArticle, updateArticle } from '@/lib/store';
import { extractPlainText, normalizeArticleHtml } from '@/lib/article-content';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']),
  visibility: z.enum(['public', 'members']).default('public'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
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

  const normalizedContent = normalizeArticleHtml(parsed.data.content);
  const plainText = extractPlainText(normalizedContent);
  if (plainText.length < 10) {
    return NextResponse.json({ error: 'Article content is too short.' }, { status: 400 });
  }

  try {
    await updateArticle(params.id, {
      title: parsed.data.title,
      content: normalizedContent,
      status: parsed.data.status,
      visibility: parsed.data.visibility,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      featuredImage: parsed.data.featuredImage,
      categoryId: parsed.data.categoryId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update article';
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
    await deleteArticle(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete article';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
