import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveEventFormSubmission } from '@/lib/store';
import { sendEmailNotification } from '@/lib/email';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    await saveEventFormSubmission({
      eventId: params.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      notes: parsed.data.notes || undefined,
    });

    void sendEmailNotification(
      `Nová registrácia na event`,
      `<p>Nová registrácia: <strong>${parsed.data.name}</strong> (${parsed.data.email})</p>${parsed.data.phone ? `<p>Tel: ${parsed.data.phone}</p>` : ''}${parsed.data.notes ? `<p>Poznámka: ${parsed.data.notes}</p>` : ''}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 503 });
  }
}
