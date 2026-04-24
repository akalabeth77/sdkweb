import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const prisma = new PrismaClient();

const deviceSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  pushToken: z.string().min(10),
});

/**
 * POST /api/v1/user/devices - Register a device for push notifications
 * 
 * Mobile apps should call this endpoint after receiving a push token from Expo/ Firebase.
 * 
 * Body:
 * {
 *   "platform": "ios" | "android" | "web",
 *   "pushToken": "ExponentPushToken[xxx...]" or FCM token
 * }
 */
export async function POST(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = deviceSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    }, { status: 400 });
  }

  const { platform, pushToken } = parsed.data;

  try {
    // Upsert device - if token already exists for this user, update lastSeenAt
    const device = await prisma.device.upsert({
      where: { pushToken },
      update: {
        platform,
        userId, // In case user changed
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        platform,
        pushToken,
      },
    });

    return NextResponse.json({
      data: device,
      message: 'Device registered successfully'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to register device',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/v1/user/devices - List user's registered devices
 */
export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' }
    });

    return NextResponse.json({ data: devices });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch devices',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/v1/user/devices - Unregister a device (provide pushToken in body)
 */
export async function DELETE(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const schema = z.object({ pushToken: z.string() });
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'pushToken required' }, { status: 400 });
  }

  try {
    const result = await prisma.device.deleteMany({
      where: {
        userId,
        pushToken: parsed.data.pushToken,
      }
    });

    return NextResponse.json({
      data: { deleted: result.count },
      message: 'Device unregistered'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to unregister device',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
