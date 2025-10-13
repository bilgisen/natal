// Client-safe stub - no Redis dependencies
const createClientSafeCacheUtils = () => ({
  /**
   * Get cached data with fallback - client-side stub
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    _ttlSeconds: number = 3600 // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<T> {
    // On client side, always call fetcher (no caching)
    if (typeof window !== 'undefined') {
      return await fetcher();
    }

    // This should never be reached on client side due to typeof window check
    throw new Error('Server-side Redis not available');
  },

  /**
   * Set cache with TTL - client-side stub
   */
  async setWithTTL(key: string, data: unknown, _ttlSeconds: number = 3600): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Client-side stub - no-op
    if (typeof window !== 'undefined') {
      return;
    }

    // This should never be reached on client side due to typeof window check
    throw new Error('Server-side Redis not available');
  },

  /**
   * Delete cache key - client-side stub
   */
  async delete(_key: string): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Client-side stub - no-op
    if (typeof window !== 'undefined') {
      return;
    }

    // This should never be reached on client side due to typeof window check
    throw new Error('Server-side Redis not available');
  },

  /**
   * Check if cache exists - client-side stub
   */
  async exists(_key: string): Promise<boolean> { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Client-side stub - always return false
    if (typeof window !== 'undefined') {
      return false;
    }

    // This should never be reached on client side due to typeof window check
    throw new Error('Server-side Redis not available');
  }
});

// Export cache utilities for client components
export const cacheUtils = createClientSafeCacheUtils();

// Server-only Redis service implementation
export const createServerRedisService = async () => {
  // Dynamic import for ioredis to avoid any client-side bundling
  const ioredis = await import('ioredis');
  const Redis = ioredis.default;

  class RedisService {
    private static instance: RedisService;
    private redis: InstanceType<typeof Redis> | null = null;
    private isConnected: boolean = false;

    private constructor() {
      // Only initialize Redis on server side
      if (typeof window === 'undefined') {
        this.initializeRedis();
      }
    }

    public static getInstance(): RedisService {
      if (!RedisService.instance) {
        RedisService.instance = new RedisService();
      }
      return RedisService.instance;
    }

    private initializeRedis() {
      try {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
          console.warn('REDIS_URL not found in environment variables. Redis caching disabled.');
          return;
        }

        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
          keepAlive: 30000,
          family: 4,
          keyPrefix: '',
          db: 0,
        });

        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
          this.isConnected = true;
        });

        this.redis.on('error', (error: Error) => {
          console.error('Redis connection error:', error);
          this.isConnected = false;
        });

        this.redis.on('close', () => {
          console.log('Redis connection closed');
          this.isConnected = false;
          this.redis = null;
        });

        // Connect to Redis
        this.redis.connect().catch((error: Error) => {
          console.error('Failed to connect to Redis:', error);
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        this.isConnected = false;
      }
    }

    public async get(key: string): Promise<string | null> {
      if (!this.redis || !this.isConnected) {
        return null;
      }

      try {
        return await this.redis.get(key);
      } catch (error) {
        console.error('Redis GET error:', error);
        return null;
      }
    }

    public async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
      if (!this.redis || !this.isConnected) {
        return false;
      }

      try {
        if (ttlSeconds) {
          return await this.redis.setex(key, ttlSeconds, value) === 'OK';
        } else {
          return await this.redis.set(key, value) === 'OK';
        }
      } catch (error) {
        console.error('Redis SET error:', error);
        return false;
      }
    }

    public async setex(key: string, seconds: number, value: string): Promise<boolean> {
      return this.set(key, value, seconds);
    }

    public async del(key: string): Promise<boolean> {
      if (!this.redis || !this.isConnected) {
        return false;
      }

      try {
        return await this.redis.del(key) > 0;
      } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
      }
    }

    public async exists(key: string): Promise<boolean> {
      if (!this.redis || !this.isConnected) {
        return false;
      }

      try {
        return await this.redis.exists(key) > 0;
      } catch (error) {
        console.error('Redis EXISTS error:', error);
        return false;
      }
    }

    public async expire(key: string, seconds: number): Promise<boolean> {
      if (!this.redis || !this.isConnected) {
        return false;
      }

      try {
        return await this.redis.expire(key, seconds) === 1;
      } catch (error) {
        console.error('Redis EXPIRE error:', error);
        return false;
      }
    }

    public isRedisAvailable(): boolean {
      return this.redis !== null && this.isConnected;
    }

    public getRedis(): InstanceType<typeof Redis> | null {
      return this.redis;
    }
  }

  return RedisService;
};

// Export singleton instance factory for server-side use
export const getRedisService = async () => {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('Redis service can only be used on the server side');
  }
  
  const RedisService = await createServerRedisService();
  return RedisService.getInstance();
};
