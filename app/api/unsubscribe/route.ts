import { NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribed?error=1', request.url));
  }

  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.redirect(new URL('/unsubscribed?error=1', request.url));
  }

  try {
    const existing = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });
    const prefs = (existing?.preferences as Record<string, unknown> | null) ?? {};

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        id: crypto.randomUUID(),
        userId,
        preferences: { ...prefs, emailNotifications: false },
      },
      update: {
        preferences: { ...prefs, emailNotifications: false },
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/unsubscribed?error=1', request.url));
  }

  return NextResponse.redirect(new URL('/unsubscribed', request.url));
}
