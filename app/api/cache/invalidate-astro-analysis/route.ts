// API endpoint to invalidate astrology analysis cache for a profile
import { NextRequest, NextResponse } from 'next/server';
import { invalidateAstroAnalysisCache } from '@/lib/astrology/serverCacheUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    await invalidateAstroAnalysisCache(profileId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error invalidating astro analysis cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
