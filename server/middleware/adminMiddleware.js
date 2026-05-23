const jwt = require('jsonwebtoken');

const getAdminSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ') && !req.query.token) {
    return res.status(403).json({ message: 'Admin access denied' });
  }

  try {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.query.token;
    const decoded = jwt.verify(token, getAdminSecret());

    if (!decoded?.admin) {
      return res.status(403).json({ message: 'Admin access denied' });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Admin access denied' });
  }
};

module.exports = {
  getAdminSecret,
  protectAdmin,
};
