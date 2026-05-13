import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyMobileToken } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const authHeader = request.headers.get('Authorization');
  const mobileToken = authHeader?.startsWith('Bearer ')
    ? (() => { try { return verifyMobileToken(authHeader.slice(7)); } catch { return null; } })()
    : null;
  const isAuthenticated = !!session?.user || !!mobileToken;

  const articles = await getPublishedArticles();
  const filtered = isAuthenticated
    ? articles
    : articles.filter((a) => a.visibility !== 'members');

  return NextResponse.json({ articles: filtered });
}
