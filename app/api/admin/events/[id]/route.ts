import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteInternalEvent, updateInternalEvent } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  start: z.string().min(1),
  end: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal(''))
});

function toIsoOrNull(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
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
    await updateInternalEvent(params.id, {
      title: parsed.data.title,
      start: startIso,
      end: endIso,
      location: parsed.data.location || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteInternalEvent(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
