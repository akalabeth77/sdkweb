import { NextResponse } from 'next/server';
import { getMobileUser } from '@/lib/mobile-auth';
import { listPendingUsers, listAllUsers } from '@/lib/users';

export async function GET(request: Request) {
  const user = getMobileUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';

  const users = all ? await listAllUsers() : await listPendingUsers();
  return NextResponse.json({ users });
}
