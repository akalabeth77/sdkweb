import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const registerSchema = z.object({
  status: z.enum(['registered', 'waiting', 'cancelled']).default('registered')
});

// POST /api/v1/events/[id]/register - Register for an event
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

  const eventId = params.id;
  const payload = await request.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    }, { status: 400 });
  }

  try {
    // TODO: Implement with Prisma
    // Check if event exists
    // const event = await prisma.internalEvent.findUnique({
    //   where: { id: eventId }
    // });
    // if (!event) {
    //   return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    // }

    // // Check if already registered
    // const existing = await prisma.eventRegistration.findUnique({
    //   where: { userId_eventId: { userId, eventId } }
    // });

    // if (existing) {
    //   // Update existing registration
    //   await prisma.eventRegistration.update({
    //     where: { id: existing.id },
    //     data: { status: parsed.data.status, updatedAt: new Date() }
    //   });
    // } else {
    //   // Create new registration
    //   await prisma.eventRegistration.create({
    //     data: { userId, eventId, status: parsed.data.status }
    //   });
    // }

    return NextResponse.json({
      data: { message: 'Registration updated successfully' }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to register for event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/v1/events/[id]/register - Cancel registration
export async function DELETE(
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

  const eventId = params.id;

  try {
    // TODO: Implement with Prisma
    // await prisma.eventRegistration.updateMany({
    //   where: { userId, eventId },
    //   data: { status: 'cancelled', updatedAt: new Date() }
    // });

    return NextResponse.json({
      data: { message: 'Registration cancelled successfully' }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to cancel registration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}