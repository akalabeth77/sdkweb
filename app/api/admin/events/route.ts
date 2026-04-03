import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInternalEvents, saveInternalEvent } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  start: z.string().datetime(),
  end: z.string().datetime().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal(''))
});

export async function GET() {
  try {
    const events = await getInternalEvents();
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await saveInternalEvent({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      start: parsed.data.start,
      end: parsed.data.end || undefined,
      location: parsed.data.location || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
