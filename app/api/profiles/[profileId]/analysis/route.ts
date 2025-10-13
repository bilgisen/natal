import { NextRequest, NextResponse } from 'next/server';
import { getRedisService } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalysisRequest {
  analysis: string;
  detailLevel: 'basic' | 'detailed';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const detailLevel = searchParams.get('detailLevel') as 'basic' | 'detailed' || 'basic';
    const profileId = req.nextUrl.pathname.split('/')[3]; // Extract profileId from path

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const cacheKey = `astroAnalysis:${profileId}:${detailLevel}`;

    // Try to get from Redis cache first
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        const cachedAnalysis = await redisService.get(cacheKey);
        if (cachedAnalysis) {
          console.log(`Returning cached analysis for profile ${profileId}`);
          return NextResponse.json({ analysis: cachedAnalysis });
        }
      }
    } catch (redisError) {
      console.warn('Redis cache check failed:', redisError);
    }

    // If not in cache, return null to trigger regeneration
    return NextResponse.json({ analysis: null });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const profileId = req.nextUrl.pathname.split('/')[3]; // Extract profileId from path

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    let requestBody: AnalysisRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { analysis, detailLevel } = requestBody;

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis content is required' },
        { status: 400 }
      );
    }

    const cacheKey = `astroAnalysis:${profileId}:${detailLevel}`;

    // Cache the analysis with long TTL (1 year) since it should only change when profile is edited
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        await redisService.setex(cacheKey, 31536000, analysis); // 1 year in seconds
        console.log(`Cached analysis for profile ${profileId} with TTL 1 year`);
      }
    } catch (redisError) {
      console.warn('Failed to cache analysis:', redisError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error storing analysis:', error);
    return NextResponse.json(
      { error: 'Failed to store analysis' },
      { status: 500 }
    );
  }
}
