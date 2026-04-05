import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInternalEvents, saveInternalEvent } from '@/lib/store';

const weekdaySchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const categorySchema = z.enum(['course', 'dance-party', 'workshop', 'festival', 'concert', 'other']);

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional().or(z.literal('')),
  category: categorySchema.optional().default('other'),
  start: z.string().min(1),
  end: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  repeat: z.boolean().optional().default(false),
  repeatUntil: z.string().optional().or(z.literal('')),
  repeatWeekdays: z.array(weekdaySchema).optional(),
});

function toDateOrNull(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function weekdayToJsDay(weekday: z.infer<typeof weekdaySchema>): number {
  if (weekday === 'sun') return 0;
  if (weekday === 'mon') return 1;
  if (weekday === 'tue') return 2;
  if (weekday === 'wed') return 3;
  if (weekday === 'thu') return 4;
  if (weekday === 'fri') return 5;
  return 6;
}

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

  const startDate = toDateOrNull(parsed.data.start);
  if (!startDate) {
    return NextResponse.json({ error: 'Invalid start date format.' }, { status: 400 });
  }

  const startIso = startDate.toISOString();

  let endIso: string | undefined;
  let endDate: Date | undefined;
  if (parsed.data.end) {
    const normalizedEnd = toDateOrNull(parsed.data.end);
    if (!normalizedEnd) {
      return NextResponse.json({ error: 'Invalid end date format.' }, { status: 400 });
    }
    endDate = normalizedEnd;
    endIso = normalizedEnd.toISOString();
  }

  try {
    if (!parsed.data.repeat) {
      await saveInternalEvent({
        id: crypto.randomUUID(),
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        category: parsed.data.category,
        start: startIso,
        end: endIso,
        location: parsed.data.location || undefined,
      });

      return NextResponse.json({ ok: true });
    }

    const repeatUntil = parsed.data.repeatUntil ? toDateOrNull(parsed.data.repeatUntil) : null;
    if (!repeatUntil) {
      return NextResponse.json({ error: 'Missing or invalid repeat-until date.' }, { status: 400 });
    }

    if (repeatUntil.getTime() < startDate.getTime()) {
      return NextResponse.json({ error: 'Repeat-until date must be after event start.' }, { status: 400 });
    }

    const weekdays = parsed.data.repeatWeekdays ?? [];
    if (weekdays.length === 0) {
      return NextResponse.json({ error: 'Select at least one repeat day.' }, { status: 400 });
    }

    const weekdaySet = new Set(weekdays.map(weekdayToJsDay));
    const durationMs = endDate ? endDate.getTime() - startDate.getTime() : null;
    if (durationMs !== null && durationMs < 0) {
      return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
    }

    const occurrences: Array<{ start: Date; end?: Date }> = [];
    const cursor = new Date(startDate);

    while (cursor.getTime() <= repeatUntil.getTime()) {
      if (weekdaySet.has(cursor.getDay())) {
        const occurrenceStart = new Date(cursor);
        const occurrenceEnd = durationMs !== null ? new Date(occurrenceStart.getTime() + durationMs) : undefined;
        occurrences.push({ start: occurrenceStart, end: occurrenceEnd });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (occurrences.length === 0) {
      return NextResponse.json({ error: 'No occurrences matched selected days and date range.' }, { status: 400 });
    }

    if (occurrences.length > 366) {
      return NextResponse.json({ error: 'Too many occurrences. Shorten date range.' }, { status: 400 });
    }

    const recurrenceGroupId = crypto.randomUUID();

    await Promise.all(
      occurrences.map((occurrence) =>
        saveInternalEvent({
          id: crypto.randomUUID(),
          title: parsed.data.title,
          description: parsed.data.description || undefined,
          category: parsed.data.category,
          start: occurrence.start.toISOString(),
          end: occurrence.end?.toISOString(),
          location: parsed.data.location || undefined,
          recurrenceGroupId,
        })
      )
    );

    return NextResponse.json({ ok: true, createdCount: occurrences.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
