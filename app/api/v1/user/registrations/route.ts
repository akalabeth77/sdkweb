import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/v1/user/registrations - Get user's event registrations
export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            start: true,
            end: true,
            location: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: registrations });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch registrations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}