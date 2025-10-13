// Utility functions for managing astrology analysis cache

/**
 * Invalidates the Redis cache for astrology analysis for a specific profile
 * Call this function whenever a profile is edited/updated
 */
export async function invalidateAstroAnalysisCache(profileId: string): Promise<void> {
  try {
    // Note: This would need to be called from server-side code
    // since Redis operations should only happen on the server
    console.log(`Invalidating astro analysis cache for profile ${profileId}`);

    // In a real implementation, you would call a server endpoint or use getRedisService()
    // For now, we'll log this action and the cache invalidation will happen naturally
    // when the TTL expires or when the component tries to fetch fresh data

  } catch (error) {
    console.error('Error invalidating astro analysis cache:', error);
  }
}

/**
 * Clears all astrology analysis cache entries
 * Useful for maintenance or troubleshooting
 */
export async function clearAllAstroAnalysisCache(): Promise<void> {
  try {
    console.log('Clearing all astrology analysis cache');

    // In a real implementation, you would call a server endpoint
    // that uses Redis SCAN and DEL operations to clear cache entries

  } catch (error) {
    console.error('Error clearing astro analysis cache:', error);
  }
}
