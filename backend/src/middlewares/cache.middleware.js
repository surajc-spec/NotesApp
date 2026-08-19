const cacheService = require('../services/cacheService');

const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Prevent browser disk caching so browser always asks server (allowing instant invalidation on upload)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const cached = await cacheService.get(cacheKey);

      if (cached && cached.data) {
        res.setHeader('X-Cache-Status', `HIT_${cached.source}`);
        return res.status(200).json(cached.data);
      }

      // Cache Miss: Intercept res.json to capture response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200 && body) {
          cacheService.set(cacheKey, body, ttlSeconds);
        }
        res.setHeader('X-Cache-Status', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

module.exports = cacheMiddleware;
