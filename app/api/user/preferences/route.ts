import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile, upsertUserProfile } from '@/lib/store';

const schema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  const prefs = (profile?.preferences as Record<string, unknown>) ?? {};
  return NextResponse.json({
    emailNotifications: prefs.emailNotifications !== false,
    pushNotifications: prefs.pushNotifications !== false,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const profile = await getUserProfile(session.user.id);
  const existing = (profile?.preferences as Record<string, unknown>) ?? {};
  await upsertUserProfile(session.user.id, {
    avatarUrl: profile?.avatarUrl,
    bio: profile?.bio,
    phone: profile?.phone,
    preferences: { ...existing, ...parsed.data },
  });
  return NextResponse.json({ ok: true });
}
