import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMobileUser } from '@/lib/mobile-auth';
import { getInternalEvents, saveInternalEvent } from '@/lib/store';
import { notifyAllDevices } from '@/lib/push';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(['course', 'dance-party', 'workshop', 'festival', 'concert', 'other']).default('other'),
  start: z.string().min(1),
  end: z.string().optional(),
  location: z.string().optional(),
});

function isEditorOrAdmin(role: string) {
  return role === 'admin' || role === 'editor';
}

export async function GET(request: Request) {
  const user = getMobileUser(request);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = await getInternalEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const user = getMobileUser(request);
  if (!user || !isEditorOrAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startDate = new Date(parsed.data.start);
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: 'Invalid start date' }, { status: 400 });
  }

  await saveInternalEvent({
    id: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description || undefined,
    category: parsed.data.category,
    start: startDate.toISOString(),
    end: parsed.data.end ? new Date(parsed.data.end).toISOString() : undefined,
    location: parsed.data.location || undefined,
    source: 'internal',
  });

  void notifyAllDevices('Nový event', parsed.data.title, { type: 'event' });
  return NextResponse.json({ ok: true });
}
