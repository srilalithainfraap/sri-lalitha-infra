const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Visit = require('../models/Visit');

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }
}

// POST /api/visits
const createVisit = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { name, email, mobile, preferredDate, preferredTime, message } = req.body;

  // Prevent the same authenticated user from booking the same date twice
  if (req.user) {
    const existing = await Visit.findOne({
      userId: req.user._id,
      preferredDate: new Date(preferredDate),
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      res.status(409);
      throw new Error('You already have a pending or confirmed visit on this date');
    }
  }

  const visit = await Visit.create({
    name, email, mobile, preferredDate, preferredTime, message,
    userId: req.user?._id ?? undefined,
  });

  res.status(201).json({ success: true, visit });
});

// GET /api/visits  (admin)
const getVisits = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);

  const [visits, total] = await Promise.all([
    Visit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId', 'name email'),
    Visit.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), visits });
});

// GET /api/visits/mine  (authenticated user)
const getMyVisits = asyncHandler(async (req, res) => {
  const visits = await Visit.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, visits });
});

// PATCH /api/visits/:id/status  (admin)
const updateVisitStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    res.status(400); throw new Error('Invalid status value');
  }
  const visit = await Visit.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!visit) { res.status(404); throw new Error('Visit not found'); }
  res.json({ success: true, visit });
});

module.exports = { createVisit, getVisits, getMyVisits, updateVisitStatus };
