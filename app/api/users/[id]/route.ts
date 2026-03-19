import { NextResponse } from 'next/server';
import { deleteUser, getCurrentUser } from '@/lib/auth';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return new NextResponse('Unauthorized', { status: 401 });
  if (user.id === params.id) return new NextResponse('Cannot delete yourself', { status: 400 });

  const removed = await deleteUser(params.id);
  if (!removed) return new NextResponse('User not found', { status: 404 });

  return new NextResponse(null, { status: 204 });
}
