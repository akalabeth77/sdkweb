import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMobileUser } from '@/lib/mobile-auth';
import { registerUserDevice } from '@/lib/store';

const schema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  pushToken: z.string().min(1),
});

export async function POST(request: Request) {
  const user = getMobileUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const device = await registerUserDevice(user.id, parsed.data.platform, parsed.data.pushToken);
  return NextResponse.json({ ok: true, device });
}
