import { NextResponse } from 'next/server';
import { createUser, getCurrentUser, listManagedUsers, type UserRole } from '@/lib/auth';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const users = await listManagedUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const body = await request.json();
  const email = String(body?.email || '').trim().toLowerCase();
  const name = String(body?.name || '').trim();
  const password = String(body?.password || '');
  const role = body?.role === 'ADMIN' ? 'ADMIN' : 'EDITOR';

  if (!email || !name || password.length < 8) {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  try {
    const created = await createUser({ name, email, password, role: role as UserRole });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create user';
    const status = message === 'User already exists' ? 409 : 500;
    return new NextResponse(message, { status });
  }
}
