import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isEditorOrAdminSession } from '@/lib/auth-utils';
import { notifyAllDevices } from '@/lib/push';
import { sendBroadcastEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

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
  const diagnostics: Record<string, unknown> = {};

  if (channels.includes('push')) {
    const devices = await prisma.device.findMany({ select: { pushToken: true } }).catch(() => []);
    const validTokens = devices.filter(d => d.pushToken.startsWith('ExponentPushToken'));
    diagnostics.pushDevicesTotal = devices.length;
    diagnostics.pushDevicesValid = validTokens.length;
    await notifyAllDevices(title, body);
  }

  if (channels.includes('email')) {
    const recipients = await prisma.appUser.findMany({
      where: { status: 'approved' },
      select: { email: true, profile: { select: { preferences: true } } },
    }).catch(() => []);
    const emailRecipients = recipients.filter(u => {
      const prefs = u.profile?.preferences as Record<string, unknown> | null;
      return prefs?.emailNotifications !== false;
    });
    diagnostics.emailRecipientsTotal = recipients.length;
    diagnostics.emailRecipientsFiltered = emailRecipients.length;
    diagnostics.resendConfigured = Boolean(process.env.RESEND_API_KEY);
    const html = `<h2>${title}</h2><p style="white-space:pre-wrap">${body}</p>`;
    await sendBroadcastEmail(title, html);
  }

  console.log('[broadcast]', diagnostics);
  return NextResponse.json({ ok: true, diagnostics });
}
