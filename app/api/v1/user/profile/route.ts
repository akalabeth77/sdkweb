import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const profileSchema = z.object({
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  preferences: z.record(z.any()).optional()
});

// GET /api/v1/user/profile - Get current user profile
export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    // TODO: Implement with Prisma
    // const profile = await prisma.userProfile.findUnique({
    //   where: { userId },
    //   include: { user: { select: { id: true, email: true, name: true, role: true } } }
    // });

    // Mock response for now
    const profile = {
      id: userId,
      user: { id: userId, email: 'user@example.com', name: 'User Name', role: 'member' },
      avatarUrl: null,
      bio: null,
      phone: null,
      preferences: {}
    };

    return NextResponse.json({ data: profile });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/v1/user/profile - Update user profile
export async function PUT(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    }, { status: 400 });
  }

  try {
    // TODO: Implement with Prisma
    // const profile = await prisma.userProfile.upsert({
    //   where: { userId },
    //   update: parsed.data,
    //   create: { userId, ...parsed.data },
    //   include: { user: { select: { id: true, email: true, name: true, role: true } } }
    // });

    return NextResponse.json({
      data: { message: 'Profile updated successfully' }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}