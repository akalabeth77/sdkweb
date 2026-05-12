import { NextResponse } from 'next/server';
import { getMobileUser } from '@/lib/mobile-auth';
import { upsertEventRegistration, getEventRegistrationStatus } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getMobileUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = await getEventRegistrationStatus(user.id, params.id);
  return NextResponse.json({ status });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getMobileUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const registration = await upsertEventRegistration(user.id, params.id, 'registered');
    return NextResponse.json({ ok: true, registration });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getMobileUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await upsertEventRegistration(user.id, params.id, 'cancelled');
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cancellation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
