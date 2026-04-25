import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId, isAuthenticatedSession } from '@/lib/auth-utils';
import { listUserNotifications, markNotificationsAsRead } from '@/lib/store';

const updateSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

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
  const limit = Number(searchParams.get('limit') || '50');

  try {
    const result = await listUserNotifications(userId, { unreadOnly, limit });
    return NextResponse.json({
      data: result.notifications,
      unreadCount: result.unreadCount,
      total: result.total,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch notifications',
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  if (!parsed.data.all && (!parsed.data.ids || parsed.data.ids.length === 0)) {
    return NextResponse.json({ error: 'No ids or all flag provided' }, { status: 400 });
  }

  try {
    const updated = await markNotificationsAsRead(userId, parsed.data.all ? undefined : parsed.data.ids);
    return NextResponse.json({
      data: { updated },
      message: parsed.data.all ? 'All notifications marked as read' : 'Notifications marked as read',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update notifications',
    }, { status: 500 });
  }
}
