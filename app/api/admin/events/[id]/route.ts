import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deleteInternalEvent,
  deleteInternalEventSeries,
  getInternalEventsByRecurrenceGroup,
  getInternalEventRecurrenceGroupId,
  updateInternalEvent,
} from '@/lib/store';

const categorySchema = z.enum(['course', 'dance-party', 'workshop', 'festival', 'concert', 'other']);

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional().or(z.literal('')),
  category: categorySchema.optional().default('other'),
  start: z.string().min(1),
  end: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
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
    });

    return NextResponse.json({ ok: true, updatedCount: 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
