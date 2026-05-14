import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isEditorOrAdminSession } from '@/lib/auth-utils';
import { notifyAllDevices } from '@/lib/push';
import { sendBroadcastEmail } from '@/lib/email';

const schema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  channels: z.array(z.enum(['push', 'email'])).default(['push']),
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

  const { title, body, channels } = parsed.data;

  if (channels.includes('push')) {
    await notifyAllDevices(title, body);
  }

  if (channels.includes('email')) {
    const html = `<h2>${title}</h2><p style="white-space:pre-wrap">${body}</p>`;
    await sendBroadcastEmail(title, html);
  }

  return NextResponse.json({ ok: true });
}
