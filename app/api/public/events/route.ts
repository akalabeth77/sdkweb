import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

export const revalidate = 300;

export async function GET() {
  const { events } = await fetchPortalData();
  return NextResponse.json({ events });
}
