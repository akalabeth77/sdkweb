import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserApproval, updateUserRole, deleteUser } from '@/lib/users';
import { isAdminSession } from '@/lib/admin';

const schema = z.union([
  z.object({ action: z.enum(['approve', 'reject']) }),
  z.object({ action: z.literal('setRole'), role: z.string().min(1) }),
]);

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
    if (parsed.data.action === 'setRole') {
      await updateUserRole(params.id, parsed.data.role);
    } else {
      await updateUserApproval(params.id, parsed.data.action);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update user';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await deleteUser(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete user';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
