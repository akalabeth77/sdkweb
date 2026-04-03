import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registerAppUser } from '@/lib/users';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await registerAppUser(parsed.data);

  if (!result.ok && result.reason === 'exists') {
    return NextResponse.json({ error: 'Používateľ s týmto emailom už existuje.' }, { status: 409 });
  }

  if (!result.ok && result.reason === 'db-not-configured') {
    return NextResponse.json({ error: 'Registrácia nie je dostupná bez databázy.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
