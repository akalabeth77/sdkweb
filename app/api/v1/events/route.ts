import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

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
