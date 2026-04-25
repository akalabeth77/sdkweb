import { NextResponse } from 'next/server';
import { getCurrentUserId, isAuthenticatedSession } from '@/lib/auth-utils';
import { listUserEventRegistrations } from '@/lib/store';

export async function GET() {
  if (!(await isAuthenticatedSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  try {
    const registrations = await listUserEventRegistrations(userId);
    return NextResponse.json({ data: registrations });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch registrations',
    }, { status: 500 });
  }
}
