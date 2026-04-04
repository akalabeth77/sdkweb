import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

export async function GET() {
  try {
    const payload = await fetchPortalData();
    return NextResponse.json({
      refreshedAt: new Date().toISOString(),
      ...payload,
    });
  } catch {
    return NextResponse.json({
      refreshedAt: new Date().toISOString(),
      events: [],
      media: [],
    });
  }
}
