import { NextResponse } from 'next/server';
import { safeFetch } from '@/lib/sanity.client';
import { eventBySlugQuery } from '@/lib/queries';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const event = await safeFetch<Record<string, any> | null>(eventBySlugQuery, { slug: params.slug }, null);
  if (!event) return new NextResponse('Not found', { status: 404 });

  const start = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${event._id}@swingdancekosice.sk\nDTSTAMP:${start}\nDTSTART:${start}\nSUMMARY:${event.title?.en || ''}\nDESCRIPTION:${event.description?.en || ''}\nLOCATION:${event.location?.name || ''}\nEND:VEVENT\nEND:VCALENDAR`;

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.slug}.ics"`
    }
  });
}
