// app/api/current-transits/route.ts
import { NextResponse } from 'next/server';
import { fetchCurrentTransits } from '@/lib/astrologer/api/fetchCurrentTransits';
import { getRedisService } from '@/lib/redis';

const CACHE_KEY = 'currentTransitsData';
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export async function GET() {
  try {
    const cacheKey = `${CACHE_KEY}:${getTodayDateString()}`;
    
    // Try to get from Redis cache first
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        const cachedData = await redisService.get(cacheKey);
        if (cachedData) {
          console.log('Returning cached current transits');
          return NextResponse.json(JSON.parse(cachedData), { status: 200 });
        }
      }
    } catch (redisError) {
      console.warn('Redis cache check failed, fetching fresh transits:', redisError);
    }

    console.log('Fetching fresh current transits data');
    const rawResponse = await fetchCurrentTransits();
    
    const responseData = { status: 'success', data: rawResponse.data };

    // Cache the result for 1 hour
    try {
      const redisService = await getRedisService();
      if (redisService && redisService.isRedisAvailable()) {
        await redisService.setex(cacheKey, 3600, JSON.stringify(responseData));
        console.log('Cached current transits for 1 hour');
      }
    } catch (cacheError) {
      console.warn('Failed to cache current transits:', cacheError);
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching current transits:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
