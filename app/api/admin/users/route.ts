import { NextResponse } from 'next/server';
import { listAllUsers } from '@/lib/users';
import { isAdminSession } from '@/lib/admin';

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await listAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch users';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
