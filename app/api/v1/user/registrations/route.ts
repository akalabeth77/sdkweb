import { NextResponse } from 'next/server';
import { isAuthenticatedSession, getCurrentUserId } from '@/lib/auth-utils';

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
    // TODO: Implement with Prisma
    // const registrations = await prisma.eventRegistration.findMany({
    //   where: { userId },
    //   include: {
    //     event: {
    //       select: {
    //         id: true,
    //         title: true,
    //         description: true,
    //         start: true,
    //         end: true,
    //         location: true,
    //         category: true
    //       }
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    // Mock response for now
    const registrations = [
      {
        id: 'reg-1',
        status: 'registered',
        createdAt: new Date().toISOString(),
        event: {
          id: 'event-1',
          title: 'Swing Dance Workshop',
          description: 'Learn basic swing moves',
          start: '2024-01-15T18:00:00Z',
          location: 'Dance Studio',
          category: 'workshop'
        }
      }
    ];

    return NextResponse.json({ data: registrations });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch registrations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}