const express  = require('express');
const asyncH   = require('express-async-handler');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const User     = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const userPayload = (u) => ({
  _id:   u._id,
  name:  u.name,
  email: u.email,
  role:  u.role,
  token: generateToken(u._id),
});

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;


// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * POST /api/users/register
 * Body: { name, email, password }
 */
router.post('/register', asyncH(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(userPayload(user));
}));


/**
 * POST /api/users/login
 * Body: { email, password }
 */
router.post('/login', asyncH(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(userPayload(user));
}));


/**
 * POST /api/users/otp/send
 * Body: { phone }
 */
router.post('/otp/send', asyncH(async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\d{10}$/.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid 10-digit phone number');
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS });

  // Demo mode: return OTP directly for frontend testing.
  res.json({
    message: 'OTP sent successfully',
    otp,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
  });
}));


/**
 * POST /api/users/otp/verify
 * Body: { phone, otp }
 */
router.post('/otp/verify', asyncH(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !/^\d{10}$/.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid 10-digit phone number');
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    res.status(400);
    throw new Error('Please provide a valid 6-digit OTP');
  }

  const entry = otpStore.get(phone);
  if (!entry) {
    res.status(400);
    throw new Error('OTP not found. Please request a new OTP');
  }

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(phone);
    res.status(400);
    throw new Error('OTP expired. Please request a new OTP');
  }

  if (entry.otp !== otp) {
    res.status(401);
    throw new Error('Invalid OTP');
  }

  otpStore.delete(phone);

  const otpEmail = `${phone}@otp.mycomart.local`;
  let user = await User.findOne({ email: otpEmail });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      name: `Myco User ${phone.slice(-4)}`,
      email: otpEmail,
      password: randomPassword,
    });
  }

  res.json(userPayload(user));
}));


// ─── Protected ────────────────────────────────────────────────────────────────

/**
 * GET /api/users/profile
 */
router.get('/profile', protect, asyncH(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, addresses: user.addresses, wishlist: user.wishlist });
}));


/**
 * PUT /api/users/profile
 * Body: { name?, email?, password? }
 */
router.put('/profile', protect, asyncH(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (req.body.name)     user.name  = req.body.name;
  if (req.body.email)    user.email = req.body.email;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json(userPayload(updated));
}));


/**
 * POST /api/users/wishlist/:productId  — toggle wishlist item
 */
router.post('/wishlist/:productId', protect, asyncH(async (req, res) => {
  const user      = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx       = user.wishlist.indexOf(productId);

  if (idx === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(idx, 1);
  }

  await user.save();
  res.json({ wishlist: user.wishlist });
}));


// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/users        (admin)
 */
router.get('/', protect, admin, asyncH(async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;
  const total = await User.countDocuments();
  const users = await User.find().limit(limit).skip(skip).sort({ createdAt: -1 });
  res.json({ total, page, pages: Math.ceil(total / limit), users });
}));


/**
 * DELETE /api/users/:id  (admin)
 */
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin account'); }
  await user.deleteOne();
  res.json({ message: 'User removed' });
}));

module.exports = router;
