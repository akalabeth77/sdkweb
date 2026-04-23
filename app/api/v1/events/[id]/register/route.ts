import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const prisma = new PrismaClient();

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
    // Check if event exists
    const event = await prisma.internalEvent.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } }
    });

    if (existing) {
      // Update existing registration
      const registration = await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: parsed.data.status, updatedAt: new Date() },
        include: { event: true }
      });
      
      return NextResponse.json({
        data: registration,
        message: 'Registration updated successfully'
      });
    } else {
      // Create new registration
      const registration = await prisma.eventRegistration.create({
        data: { userId, eventId, status: parsed.data.status },
        include: { event: true }
      });
      
      return NextResponse.json({
        data: registration,
        message: 'Successfully registered for event'
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to register for event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
    const result = await prisma.eventRegistration.updateMany({
      where: { userId, eventId, status: { not: 'cancelled' } },
      data: { status: 'cancelled', updatedAt: new Date() }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'No active registration found' }, { status: 404 });
    }

    return NextResponse.json({
      data: { cancelled: result.count },
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to cancel registration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}