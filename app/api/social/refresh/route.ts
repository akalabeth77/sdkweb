import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

// Simple API token check for server-to-server calls
// For mobile app in future, use this header or JWT
const expectedToken = process.env.API_REFRESH_TOKEN;

export async function GET(request: Request) {
  // Basic protection: require API token via Authorization header
  if (expectedToken) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    // In development, warn but allow
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN] API_REFRESH_TOKEN not set, endpoint is publicly accessible');
    }
  }

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
