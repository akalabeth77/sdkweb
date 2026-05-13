import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';
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

  const { media } = await fetchPortalData();
  const nativeMedia = media.filter(
    (m) =>
      m.source !== 'instagram-embed' &&
      m.imageUrl.length > 0 &&
      (isAuthenticated || m.visibility !== 'members')
  );
  return NextResponse.json({ media: nativeMedia });
}
