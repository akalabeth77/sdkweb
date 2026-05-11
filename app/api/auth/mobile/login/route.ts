import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findAppUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/password';
import { signMobileToken } from '@/lib/mobile-auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const user = await findAppUserByEmail(parsed.data.email);

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.status !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
  }

  const token = signMobileToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
