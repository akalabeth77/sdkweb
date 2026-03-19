import { NextResponse } from 'next/server';
import { getFacebookPageUrl, getFacebookPosts } from '@/lib/facebook';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [posts, pageUrl] = await Promise.all([getFacebookPosts(), getFacebookPageUrl()]);
  return NextResponse.json({ posts, pageUrl });
}
