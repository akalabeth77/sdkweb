import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authSecret } from '@/lib/auth-secret';

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function createUnauthorizedResponse(request: NextRequest, status: 401 | 403, error: string) {
  if (isApiRequest(request.nextUrl.pathname)) {
    return NextResponse.json({ error }, { status });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  if (error) {
    loginUrl.searchParams.set('error', error);
  }

  return NextResponse.redirect(loginUrl);
}

export default async function middleware(request: NextRequest) {
  if (!authSecret) {
    return createUnauthorizedResponse(request, 401, 'config');
  }

  try {
    const token = await getToken({ req: request, secret: authSecret });

    if (!token) {
      return createUnauthorizedResponse(request, 401, 'signin');
    }

    const pathname = request.nextUrl.pathname;
    const adminOnlyRoute = pathname.startsWith('/admin/users') || pathname.startsWith('/api/admin/users');

    if (adminOnlyRoute && token.role !== 'admin') {
      return createUnauthorizedResponse(request, 403, 'forbidden');
    }

    return NextResponse.next();
  } catch {
    return createUnauthorizedResponse(request, 401, 'session');
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
