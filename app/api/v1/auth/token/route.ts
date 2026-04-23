import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars';
const JWT_EXPIRES_IN = '30d';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * POST /api/v1/auth/token
 * 
 * Mobile-friendly authentication endpoint that returns a JWT token.
 * Use this endpoint for React Native / mobile app authentication.
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "user-id",
 *     "email": "user@example.com",
 *     "name": "User Name",
 *     "role": "member"
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten()
      }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.appUser.findUnique({
      where: { email },
    });

    // Check if user exists and is approved
    if (!user || user.status !== 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials or account not approved'
      }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/v1/auth/token
 * Returns info about the token endpoint (for documentation)
 */
export async function GET() {
  return NextResponse.json({
    info: 'Mobile authentication endpoint',
    usage: 'POST with { email, password } to receive JWT token',
    note: 'Use the token in Authorization header: Bearer <token>',
  });
}
