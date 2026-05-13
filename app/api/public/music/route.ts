import { NextResponse } from 'next/server';
import { getSpotifyPlaylists } from '@/lib/store';

export const revalidate = 900;

export async function GET() {
  const playlists = await getSpotifyPlaylists();
  return NextResponse.json({ playlists: playlists.filter((p) => p.isActive) });
}
