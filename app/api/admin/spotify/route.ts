import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSpotifyPlaylists, saveSpotifyPlaylist } from '@/lib/store';
import { isEditorOrAdminSession } from '@/lib/auth-utils';

const schema = z.object({
  title: z.string().min(2),
  spotifyUrl: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export async function GET() {
  if (!(await isEditorOrAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const playlists = await getSpotifyPlaylists();
  return NextResponse.json(playlists);
}

export async function POST(request: Request) {
  if (!(await isEditorOrAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    await saveSpotifyPlaylist({ id: crypto.randomUUID(), title: parsed.data.title, spotifyUrl: parsed.data.spotifyUrl, description: parsed.data.description || undefined, isActive: parsed.data.isActive });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 503 });
  }
}
