import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findAppUserByEmail, createGoogleUser } from '@/lib/users';
import { signMobileToken } from '@/lib/mobile-auth';

const schema = z.object({ accessToken: z.string().min(1) });

type GoogleUserInfo = {
  email?: string;
  name?: string;
  verified_email?: boolean;
};

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const res = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${parsed.data.accessToken}`
  );
  if (!res.ok) {
    return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
  }

  const googleUser = (await res.json()) as GoogleUserInfo;
  if (!googleUser.email || !googleUser.verified_email) {
    return NextResponse.json({ error: 'Google account email not verified' }, { status: 401 });
  }

  let user = await findAppUserByEmail(googleUser.email);

  if (!user) {
    try {
      await createGoogleUser({ email: googleUser.email, name: googleUser.name || googleUser.email });
    } catch {
      return NextResponse.json({ error: 'Registration failed' }, { status: 503 });
    }
    return NextResponse.json({ pending: true }, { status: 202 });
  }

  if (user.status === 'pending') {
    return NextResponse.json({ pending: true }, { status: 202 });
  }

  if (user.status === 'rejected') {
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
