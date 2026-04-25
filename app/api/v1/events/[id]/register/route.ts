import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUserId, isAuthenticatedSession } from '@/lib/auth-utils';
import { getEventRegistrationStatus, upsertEventRegistration } from '@/lib/store';

const registerSchema = z.object({
  status: z.enum(['registered', 'waiting', 'cancelled']).default('registered'),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const status = await getEventRegistrationStatus(userId, params.id);
    return NextResponse.json({ data: { status } });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch registration status',
    }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const registration = await upsertEventRegistration(userId, params.id, parsed.data.status);
    return NextResponse.json({
      data: registration,
      message: parsed.data.status === 'cancelled'
        ? 'Registration cancelled successfully'
        : 'Registration updated successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register for event';
    return NextResponse.json({ error: message }, { status: message === 'Event not found.' ? 404 : 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const registration = await upsertEventRegistration(userId, params.id, 'cancelled');
    return NextResponse.json({
      data: registration,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel registration';
    return NextResponse.json({ error: message }, { status: message === 'Event not found.' ? 404 : 500 });
  }
}
