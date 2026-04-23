import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getArticles } from '@/lib/store';
import { isAuthenticatedSession, isEditorOrAdminSession } from '@/lib/auth-utils';

// GET /api/v1/articles - Public endpoint for published articles
export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get('drafts') === 'true';

  try {
    const articles = await getArticles();

    // Filter out drafts unless user is authenticated and has permission
    let filteredArticles = articles;
    if (!includeDrafts || !(await isEditorOrAdminSession())) {
      filteredArticles = articles.filter(article => article.status === 'published');
    }

    // Return clean API response
    const response = filteredArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      author: article.author,
      publishedAt: article.publishedAt || article.createdAt,
      updatedAt: article.updatedAt,
      status: article.status,
      views: article.views
    }));

    return NextResponse.json({ data: response });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch articles' }, { status: 500 });
  }
}

// POST /api/v1/articles - Protected endpoint for creating articles
export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    categoryId: z.string().optional(),
    status: z.enum(['draft', 'published']).default('draft')
  });

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    }, { status: 400 });
  }

  try {
    // TODO: Implement with Prisma
    // const article = await prisma.article.create({
    //   data: {
    //     ...parsed.data,
    //     author: session.user.name,
    //     publishedAt: parsed.data.status === 'published' ? new Date() : null
    //   }
    // });

    return NextResponse.json({
      data: { id: 'temp-id', message: 'Article created successfully' }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create article',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}