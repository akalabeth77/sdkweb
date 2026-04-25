import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, isAuthenticatedSession } from '@/lib/auth-utils';
import { getUserProfile, upsertUserProfile } from '@/lib/store';

const profileSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().max(32).optional().or(z.literal('')),
  preferences: z.record(z.any()).optional(),
});

export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(user.id);

    return NextResponse.json({
      data: {
        user,
        profile: profile ?? {
          avatarUrl: '',
          bio: '',
          phone: '',
          preferences: {},
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const profile = await upsertUserProfile(user.id, {
      avatarUrl: parsed.data.avatarUrl || undefined,
      bio: parsed.data.bio || undefined,
      phone: parsed.data.phone || undefined,
      preferences: parsed.data.preferences,
    });

    return NextResponse.json({
      data: {
        user,
        profile,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update profile',
    }, { status: 500 });
  }
}
