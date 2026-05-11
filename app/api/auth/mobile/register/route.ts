import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registerAppUser } from '@/lib/users';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await registerAppUser(parsed.data);

  if (!result.ok) {
    if (result.reason === 'exists') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration unavailable' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
