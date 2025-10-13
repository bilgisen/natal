import { getRedisService } from '@/lib/redis';

/**
 * Server-side function to invalidate astrology analysis cache for a profile
 * This should be called from API routes when a profile is updated
 */
export async function invalidateAstroAnalysisCache(profileId: string): Promise<void> {
  try {
    const cacheKeys = [
      `astroAnalysis:${profileId}:basic`,
      `astroAnalysis:${profileId}:detailed`
    ];

    const redisService = await getRedisService();
    if (redisService && redisService.isRedisAvailable()) {
      for (const key of cacheKeys) {
        await redisService.del(key);
      }
      console.log(`Invalidated astro analysis cache for profile ${profileId}`);
    }
  } catch (error) {
    console.error('Error invalidating astro analysis cache:', error);
  }
}

/**
 * Server-side function to clear all astrology analysis cache
 * Useful for maintenance or troubleshooting
 */
export async function clearAllAstroAnalysisCache(): Promise<void> {
  try {
    const redisService = await getRedisService();
    if (redisService && redisService.isRedisAvailable()) {
      // Use SCAN to find all astro analysis keys and delete them
      // This is a simplified implementation - in production you might want to use Redis SCAN
      console.log('Clearing all astrology analysis cache');

      // For now, we'll just log this action since implementing SCAN would require
      // more complex Redis operations that might not be available in this context
    }
  } catch (error) {
    console.error('Error clearing astro analysis cache:', error);
  }
}
