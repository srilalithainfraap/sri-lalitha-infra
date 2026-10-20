const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Sets req.user if a valid Bearer token is present, but does NOT reject
 * unauthenticated requests. Use this for routes that are public but can
 * provide richer behavior when the caller is logged in.
 */
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) req.user = user;
  } catch {
    // Invalid/expired token is silently ignored for optional-auth routes
  }
  next();
}

module.exports = { optionalAuth };
