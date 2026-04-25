import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

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
