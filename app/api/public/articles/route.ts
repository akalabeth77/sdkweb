import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/store';

export const revalidate = 900;

export async function GET() {
  const articles = await getPublishedArticles();
  return NextResponse.json({ articles });
}
