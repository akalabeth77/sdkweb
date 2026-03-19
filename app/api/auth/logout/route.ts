import { NextResponse } from 'next/server';
import { sessionCookieName } from '@/lib/auth';

export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set({
    name: sessionCookieName(),
    value: '',
    path: '/',
    maxAge: 0
  });
  return response;
}
