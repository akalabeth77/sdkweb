import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'change-this-secret-in-production-min-32-chars';
const JWT_EXPIRES_IN = '30d';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function createSignedToken(payload: { userId: string; email: string; role: string }) {
  const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
  const body = {
    ...payload,
    exp: expiresAt,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten(),
      }, { status: 400 });
    }

    const user = await prisma.appUser.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || user.status !== 'approved' || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials or account not approved',
      }, { status: 401 });
    }

    const token = createSignedToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'Mobile authentication endpoint',
    usage: 'POST with { email, password } to receive JWT token',
    note: 'Use the token in the Authorization header as Bearer <token> for future mobile endpoints.',
  });
}
