import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMobileUser } from '@/lib/mobile-auth';
import { updateUserApproval } from '@/lib/users';

const schema = z.object({
  action: z.enum(['approve', 'reject']),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getMobileUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await updateUserApproval(params.id, parsed.data.action);
  return NextResponse.json({ ok: true });
}
