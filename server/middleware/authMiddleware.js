const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getCache,
  setCache,
} = require('../services/cacheService');

const AUTH_CACHE_TTL_SECONDS = Number(process.env.AUTH_CACHE_TTL_SECONDS || 300);

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'User account no longer exists. Please login again.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized, token failed. Please login again.',
      });
    }
  }

  return res.status(401).json({
    message: 'Not authorized, no token',
  });
};

const protectCached = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const key = `noteshare:auth:user:${decoded.id}`;
      const cachedUser = await getCache(key);

      if (cachedUser) {
        req.user = cachedUser;
        return next();
      }

      const user = await User.findById(decoded.id)
        .select('-password')
        .lean();

      if (!user) {
        return res.status(401).json({
          message: 'User account no longer exists. Please login again.',
        });
      }

      const safeUser = {
        ...user,
        id: String(user._id),
      };

      await setCache(key, safeUser, AUTH_CACHE_TTL_SECONDS);

      req.user = safeUser;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized, token failed. Please login again.',
      });
    }
  }

  return res.status(401).json({
    message: 'Not authorized, no token',
  });
};

module.exports = {
  protect,
  protectCached,
};
