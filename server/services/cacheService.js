const NodeCache = require('node-cache');

const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 600);
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL_SECONDS,
  checkperiod: 120,
});

let redisClient = null;
let redisReady = false;
let redisUnavailable = false;

const getRedisClient = async () => {
  if (!process.env.REDIS_URL || redisUnavailable) return null;

  if (redisClient) return redisClient;

  try {
    const { createClient } = require('redis');

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      redisReady = false;
      console.warn('Redis cache error:', err.message);
    });

    redisClient.on('ready', () => {
      redisReady = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    redisReady = false;
    redisClient = null;
    redisUnavailable = true;
    console.warn('Redis cache disabled:', err.message);
    return null;
  }
};

const getCache = async (key) => {
  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : undefined;
  }

  return cache.get(key);
};

const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    await redis.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
    return;
  }

  cache.set(key, value, ttlSeconds);
};

const deleteCache = async (key) => {
  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    await redis.del(key);
    return;
  }

  cache.del(key);
};

const clearCache = async () => {
  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    const keys = await redis.keys('noteshare:*');

    if (keys.length) {
      await redis.del(keys);
    }

    return;
  }

  cache.flushAll();
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
};
