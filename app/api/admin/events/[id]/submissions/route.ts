import { NextResponse } from 'next/server';
import { getEventFormSubmissions } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isEditorOrAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const submissions = await getEventFormSubmissions(params.id);
  return NextResponse.json({ submissions });
}
