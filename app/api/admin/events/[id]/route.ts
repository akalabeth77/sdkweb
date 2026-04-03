import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateInternalEvent } from '@/lib/store';

const schema = z.object({
  title: z.string().min(3),
  start: z.string().datetime(),
  end: z.string().datetime().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal(''))
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await updateInternalEvent(params.id, {
      title: parsed.data.title,
      start: parsed.data.start,
      end: parsed.data.end || undefined,
      location: parsed.data.location || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update event';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
