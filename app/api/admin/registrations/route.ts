import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/admin';
import { listAllEventRegistrations } from '@/lib/store';

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const registrations = await listAllEventRegistrations();
    return NextResponse.json({ data: registrations });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to fetch registrations',
    }, { status: 503 });
  }
}
