import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchPortalData } from '@/lib/social';
import { isAuthenticatedSession, isEditorOrAdminSession, getCurrentUserId } from '@/lib/auth-utils';

// GET /api/v1/events - Public endpoint for events
export async function GET() {
  try {
    const { events } = await fetchPortalData();

    // Return clean API response
    const response = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      start: event.start,
      end: event.end,
      location: event.location,
      source: event.source,
      recurrenceGroupId: event.recurrenceGroupId
    }));

    return NextResponse.json({ data: response });
  } catch {
    return NextResponse.json({ error: 'Unable to fetch events' }, { status: 500 });
  }
}

// POST /api/v1/events - Protected endpoint for creating events
export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    category: z.enum(['course', 'dance-party', 'workshop', 'festival', 'concert', 'other']).optional(),
    start: z.string(),
    end: z.string().optional(),
    location: z.string().optional()
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
    // TODO: Implement with Prisma
    // const event = await prisma.internalEvent.create({
    //   data: parsed.data
    // });

    return NextResponse.json({
      data: { id: 'temp-id', message: 'Event created successfully' }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}