const Redis = require('ioredis');
const NodeCache = require('node-cache');

// Level 1: In-Memory Process RAM Cache (0.1ms latency)
const memoryCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Level 2: Distributed Redis RAM Cache (2-5ms latency)
let redisClient = null;
let isRedisConnected = false;

try {
  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = Number(process.env.REDIS_PORT || 6379);

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Disable infinite retries if Redis server is unconfigured
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log('✅ Connected to Redis Cache Engine');
  }).catch(() => {
    console.log('ℹ️ Redis server offline - using In-Memory RAM Cache Fallback');
  });
} catch (err) {
  console.log('ℹ️ Redis initialization skipped - using In-Memory RAM Cache Fallback');
}

/**
 * Multi-Level Cache Service
 * Modes: 'none' | 'redis' | 'multilevel'
 */
class CacheService {
  constructor() {
    this.mode = process.env.CACHE_MODE || 'multilevel'; // Default to multilevel for maximum performance
  }

  setMode(mode) {
    this.mode = mode;
  }

  async get(key) {
    if (this.mode === 'none') return null;

    // 1. Level 1 Check: In-Memory Cache (0.1ms)
    if (this.mode === 'multilevel') {
      const memoryResult = memoryCache.get(key);
      if (memoryResult) {
        return { data: memoryResult, source: 'LEVEL_1_MEMORY' };
      }
    }

    // 2. Level 2 Check: Redis Distributed Cache (2-5ms)
    if ((this.mode === 'redis' || this.mode === 'multilevel') && isRedisConnected && redisClient) {
      try {
        const redisData = await redisClient.get(key);
        if (redisData) {
          const parsed = JSON.parse(redisData);
          // Populate Level 1 memory cache for subsequent requests
          if (this.mode === 'multilevel') {
            memoryCache.set(key, parsed);
          }
          return { data: parsed, source: 'LEVEL_2_REDIS' };
        }
      } catch (err) {
        console.warn('Redis read error:', err.message);
      }
    }

    // 3. Fallback Level 1 Memory Cache if Redis mode is active but Redis server is offline
    const fallbackData = memoryCache.get(key);
    if (fallbackData) {
      return { data: fallbackData, source: 'LEVEL_1_MEMORY_FALLBACK' };
    }

    return null;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.mode === 'none') return;

    // Set Level 1 Memory Cache
    memoryCache.set(key, value, ttlSeconds);

    // Set Level 2 Redis Cache
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch (err) {
        console.warn('Redis set error:', err.message);
      }
    }
  }

  async flush() {
    memoryCache.flushAll();
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.flushdb();
      } catch (err) {
        console.warn('Redis flush error:', err.message);
      }
    }
  }
}

module.exports = new CacheService();
