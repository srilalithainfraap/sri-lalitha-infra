const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Plot = require('../models/Plot');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { name, email, mobile, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, mobile, passwordHash });

  res.status(201).json({
    success: true,
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedPlots');
  const savedPlots = (user.savedPlots ?? []).filter(Boolean).map((p) => p.plotId);
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, savedPlots },
  });
});

// POST /api/auth/logout  (client-side token discard; server-side is stateless)
const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: 'Logged out — please discard your token' });
});

// PATCH /api/auth/saved-plots  (toggle a saved plot by plotId string e.g. 'P001')
const toggleSavedPlot = asyncHandler(async (req, res) => {
  const { plotId } = req.body;
  if (!plotId) { res.status(400); throw new Error('plotId is required'); }

  const plot = await Plot.findOne({ plotId });
  if (!plot) { res.status(404); throw new Error('Plot not found'); }

  const user = await User.findById(req.user._id);
  const mongoId = plot._id.toString();
  const idx = user.savedPlots.findIndex((id) => id.toString() === mongoId);
  if (idx === -1) {
    user.savedPlots.push(plot._id);
  } else {
    user.savedPlots.splice(idx, 1);
  }
  await user.save();

  const updated = await User.findById(user._id).populate('savedPlots');
  const savedPlots = (updated.savedPlots ?? []).filter(Boolean).map((p) => p.plotId);

  res.json({ success: true, savedPlots });
});

module.exports = { register, login, getMe, logout, toggleSavedPlot };
