import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSpotifyPlaylist, deleteSpotifyPlaylist } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const schema = z.object({
  title: z.string().min(2),
  spotifyUrl: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isEditorOrAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    await updateSpotifyPlaylist(params.id, { title: parsed.data.title, spotifyUrl: parsed.data.spotifyUrl, description: parsed.data.description || undefined, isActive: parsed.data.isActive });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isEditorOrAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await deleteSpotifyPlaylist(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 503 });
  }
}
