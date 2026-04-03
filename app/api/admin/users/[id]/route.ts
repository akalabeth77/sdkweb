import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserApproval } from '@/lib/users';
import { isAdminSession } from '@/lib/admin';

const schema = z.object({
  action: z.enum(['approve', 'reject']),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await updateUserApproval(params.id, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update user';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
