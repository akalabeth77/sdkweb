import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isEditorOrAdminSession } from '@/lib/auth-utils';
import { notifyAllDevices } from '@/lib/push';

const schema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
});

export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await notifyAllDevices(parsed.data.title, parsed.data.body);
  return NextResponse.json({ ok: true });
}
