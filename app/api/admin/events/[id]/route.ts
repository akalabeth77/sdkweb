import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deleteInternalEvent,
  deleteInternalEventSeries,
  getInternalEventsByRecurrenceGroup,
  getInternalEventRecurrenceGroupId,
  getInternalEventById,
  saveInternalEvent,
  updateInternalEvent,
} from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const weekdaySchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

function weekdayToJsDay(weekday: z.infer<typeof weekdaySchema>): number {
  const map: Record<string, number> = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
  return map[weekday];
}

const extendSchema = z.object({
  extendUntil: z.string().min(1),
  weekdays: z.array(weekdaySchema).min(1),
});

const categorySchema = z.enum(['course', 'dance-party', 'workshop', 'festival', 'concert', 'other']);

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional().or(z.literal('')),
  category: categorySchema.optional().default('other'),
  start: z.string().min(1),
  end: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  registrationUrl: z.string().url().optional().or(z.literal('')),
  hasRegistrationForm: z.boolean().optional().default(false),
  isInternal: z.boolean().optional().default(true),
  applyToSeries: z.boolean().optional().default(false),
});

function toIsoOrNull(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function applyTimeToDate(dateIso: string, timeIso: string): string {
  const baseDate = new Date(dateIso);
  const timeSource = new Date(timeIso);

  baseDate.setHours(
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds()
  );

  return baseDate.toISOString();
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startIso = toIsoOrNull(parsed.data.start);
  if (!startIso) {
    return NextResponse.json({ error: 'Invalid start date format.' }, { status: 400 });
  }

  let endIso: string | undefined;
  if (parsed.data.end) {
    const normalizedEnd = toIsoOrNull(parsed.data.end);
    if (!normalizedEnd) {
      return NextResponse.json({ error: 'Invalid end date format.' }, { status: 400 });
    }
    endIso = normalizedEnd;
  }

  try {
    if (parsed.data.applyToSeries) {
      const recurrenceGroupId = await getInternalEventRecurrenceGroupId(params.id);
      if (recurrenceGroupId) {
        const seriesItems = await getInternalEventsByRecurrenceGroup(recurrenceGroupId);

        await Promise.all(
          seriesItems.map((seriesItem) => {
            const adjustedStart = applyTimeToDate(seriesItem.start, startIso);
            const adjustedEnd = endIso
              ? applyTimeToDate(seriesItem.start, endIso)
              : undefined;

            return updateInternalEvent(seriesItem.id, {
              title: parsed.data.title,
              description: parsed.data.description || undefined,
              category: parsed.data.category,
              start: adjustedStart,
              end: adjustedEnd,
              location: parsed.data.location || undefined,
              registrationUrl: parsed.data.registrationUrl || undefined,
              source: parsed.data.isInternal ? 'internal' : 'external',
            });
          })
        );

        const updatedCount = seriesItems.length;

        return NextResponse.json({ ok: true, updatedCount });
      }
    }

    await updateInternalEvent(params.id, {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      category: parsed.data.category,
      start: startIso,
      end: endIso,
      location: parsed.data.location || undefined,
      registrationUrl: parsed.data.registrationUrl || undefined,
      source: parsed.data.isInternal ? 'internal' : 'external',
    });

    return NextResponse.json({ ok: true, updatedCount: 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = extendSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const extendUntil = new Date(parsed.data.extendUntil);
  if (isNaN(extendUntil.getTime())) {
    return NextResponse.json({ error: 'Invalid extendUntil date' }, { status: 400 });
  }
  extendUntil.setHours(23, 59, 59, 999);

  const recurrenceGroupId = await getInternalEventRecurrenceGroupId(params.id);
  if (!recurrenceGroupId) {
    return NextResponse.json({ error: 'Event is not part of a series' }, { status: 400 });
  }

  const seriesItems = await getInternalEventsByRecurrenceGroup(recurrenceGroupId);
  if (seriesItems.length === 0) {
    return NextResponse.json({ error: 'Series not found' }, { status: 404 });
  }

  const template = await getInternalEventById(params.id);
  if (!template) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const lastItem = seriesItems[seriesItems.length - 1];
  const lastDate = new Date(lastItem.start.replace(/Z$/, ''));

  const templateStart = new Date(template.start.replace(/Z$/, ''));
  const templateEnd = template.end ? new Date(template.end.replace(/Z$/, '')) : undefined;
  const durationMs = templateEnd ? templateEnd.getTime() - templateStart.getTime() : null;

  const cursor = new Date(lastDate);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(templateStart.getHours(), templateStart.getMinutes(), 0, 0);

  const weekdaySet = new Set(parsed.data.weekdays.map(weekdayToJsDay));
  const occurrences: Array<{ start: Date; end?: Date }> = [];

  while (cursor.getTime() <= extendUntil.getTime()) {
    if (weekdaySet.has(cursor.getDay())) {
      const s = new Date(cursor);
      const e = durationMs !== null ? new Date(s.getTime() + durationMs) : undefined;
      occurrences.push({ start: s, end: e });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (occurrences.length === 0) {
    return NextResponse.json({ error: 'No new occurrences matched' }, { status: 400 });
  }
  if (occurrences.length > 366) {
    return NextResponse.json({ error: 'Too many occurrences. Shorten the range.' }, { status: 400 });
  }

  try {
    await Promise.all(occurrences.map(occ =>
      saveInternalEvent({
        id: crypto.randomUUID(),
        title: template.title,
        description: template.description,
        category: template.category,
        start: occ.start.toISOString(),
        end: occ.end?.toISOString(),
        location: template.location,
        registrationUrl: template.registrationUrl,
        hasRegistrationForm: (template as any).hasRegistrationForm ?? false,
        source: (template.source === 'internal' || template.source === 'external') ? template.source : 'internal',
        recurrenceGroupId,
      })
    ));
    return NextResponse.json({ ok: true, createdCount: occurrences.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to extend series';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const scope = new URL(request.url).searchParams.get('scope');
    if (scope === 'series') {
      const recurrenceGroupId = await getInternalEventRecurrenceGroupId(params.id);
      if (recurrenceGroupId) {
        const deletedCount = await deleteInternalEventSeries(recurrenceGroupId);
        return NextResponse.json({ ok: true, deletedCount });
      }
    }

    await deleteInternalEvent(params.id);
    return NextResponse.json({ ok: true, deletedCount: 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
