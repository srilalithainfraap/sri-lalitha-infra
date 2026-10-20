const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Not authenticated — invalid or expired token');
  }

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) {
    res.status(401);
    throw new Error('Not authenticated — user no longer exists');
  }

  req.user = user;
  next();
});

module.exports = { protect };
