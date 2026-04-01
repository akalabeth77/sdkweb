import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

export async function GET() {
  const payload = await fetchPortalData();
  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    ...payload
  });
}
