const jwt     = require('jsonwebtoken');
const asyncH  = require('express-async-handler');
const User    = require('../models/User');

/**
 * Protect: requires a valid JWT in the Authorization header.
 * Bearer <token>
 */
const protect = asyncH(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised — no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised — invalid token');
  }
});

/**
 * Admin: must be used after protect().
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorised — admin only');
};

module.exports = { protect, admin };
