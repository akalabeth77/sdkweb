import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/store';

export async function GET() {
  try {
    const articles = await getPublishedArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch articles' }, { status: 500 });
  }
}
