import { NextResponse } from 'next/server';
import { fetchPortalData } from '@/lib/social';

export const revalidate = 900;

export async function GET() {
  const { media } = await fetchPortalData();
  // instagram-embed items sú len HTML bloky, v natívnej app nemajú zmysel
  const nativeMedia = media.filter(
    (m) => m.source !== 'instagram-embed' && m.imageUrl.length > 0
  );
  return NextResponse.json({ media: nativeMedia });
}
