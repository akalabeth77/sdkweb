import { NextResponse } from 'next/server';
import { authenticate, createSessionToken, ensureBootstrapAdmin, sessionCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  await ensureBootstrapAdmin();

  const body = await request.json();
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  const user = await authenticate(email, password);
  if (!user) return new NextResponse('Invalid credentials', { status: 401 });

  const token = createSessionToken(user);
  const response = NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });

  response.cookies.set({
    name: sessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
