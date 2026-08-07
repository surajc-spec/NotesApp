const cacheService = require('../services/cacheService');

const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cached = await cacheService.get(cacheKey);

      if (cached && cached.data) {
        // Level 3: Add Browser & CDN HTTP Caching Headers if in Multi-Level Mode
        if (cacheService.mode === 'multilevel') {
          res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds * 2}`);
          res.setHeader('X-Cache-Status', `HIT_${cached.source}`);
        } else if (cacheService.mode === 'redis') {
          res.setHeader('X-Cache-Status', `HIT_${cached.source}`);
        }

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
