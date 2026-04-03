import { NextResponse } from 'next/server';
import { listPendingUsers } from '@/lib/users';
import { isAdminSession } from '@/lib/admin';

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await listPendingUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Unable to fetch users' }, { status: 500 });
  }
}
