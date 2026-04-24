import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/v1/user/notifications - Get user's notifications
export async function GET(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return NextResponse.json({
      data: notifications,
      unreadCount,
      total: unreadOnly ? unreadCount : await prisma.notification.count({ where: { userId } })
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch notifications',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/v1/user/notifications - Mark notifications as read
// Body: { ids: string[] } or { all: true }
export async function PUT(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const schema = z.object({
    ids: z.array(z.string()).optional(),
    all: z.boolean().optional()
  });

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    }, { status: 400 });
  }

  try {
    const { ids, all } = parsed.data;

    if (all) {
      // Mark all as read
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ 
        data: { updated: result.count },
        message: 'All notifications marked as read' 
      });
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      const result = await prisma.notification.updateMany({
        where: { 
          id: { in: ids },
          userId // Ensure user owns these notifications
        },
        data: { isRead: true }
      });
      return NextResponse.json({ 
        data: { updated: result.count },
        message: 'Notifications marked as read' 
      });
    }

    return NextResponse.json({ error: 'No ids or all flag provided' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update notifications',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
