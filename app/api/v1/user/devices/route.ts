import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId, isAuthenticatedSession } from '@/lib/auth-utils';
import { deleteUserDevice, listUserDevices, registerUserDevice } from '@/lib/store';

const deviceSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  pushToken: z.string().min(10),
});

const deleteSchema = z.object({
  pushToken: z.string().min(10),
});

export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const devices = await listUserDevices(userId);
    return NextResponse.json({ data: devices });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch devices',
    }, { status: 500 });
  }
}

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
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const device = await registerUserDevice(userId, parsed.data.platform, parsed.data.pushToken);
    return NextResponse.json({
      data: device,
      message: 'Device registered successfully',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to register device',
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = deleteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const deleted = await deleteUserDevice(userId, parsed.data.pushToken);
    return NextResponse.json({
      data: { deleted },
      message: 'Device unregistered',
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to unregister device',
    }, { status: 500 });
  }
}
