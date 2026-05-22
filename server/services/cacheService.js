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
  const memoryValue = cache.get(key);

  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    const value = await redis.get(key);

    if (!value) {
      return undefined;
    }

    const parsed = JSON.parse(value);
    cache.set(key, parsed, DEFAULT_TTL_SECONDS);
    return parsed;
  }

  return undefined;
};

const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  cache.set(key, value, ttlSeconds);

  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    await redis.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }
};

const deleteCache = async (key) => {
  cache.del(key);

  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    await redis.del(key);
  }
};

const clearCache = async () => {
  cache.flushAll();

  const redis = await getRedisClient();

  if (redis && (redisReady || redis.isReady)) {
    const keys = await redis.keys('noteshare:*');

    if (keys.length) {
      await redis.del(keys);
    }

    return;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
};
