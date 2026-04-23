import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const prisma = new PrismaClient();

const profileSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal('')),
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
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });

    if (!profile) {
      // Return empty profile if not created yet
      return NextResponse.json({
        data: {
          user: await prisma.appUser.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true }
          }),
          avatarUrl: null,
          bio: null,
          phone: null,
          preferences: {}
        }
      });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
    const data = parsed.data;
    // Clean empty strings to null for optional URL fields
    if (data.avatarUrl === '') {
      data.avatarUrl = undefined;
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({
      data: profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}