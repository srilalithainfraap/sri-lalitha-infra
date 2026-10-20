const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Enquiry = require('../models/Enquiry');

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }
}

// POST /api/enquiries
const createEnquiry = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { name, email, mobile, message, plotId, plotNumber } = req.body;
  const enquiry = await Enquiry.create({
    name, email, mobile, message, plotId, plotNumber,
    userId: req.user?._id ?? undefined,
  });
  res.status(201).json({ success: true, enquiry });
});

// GET /api/enquiries  (admin)
const getEnquiries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId', 'name email'),
    Enquiry.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), enquiries });
});

// GET /api/enquiries/mine  (authenticated user)
const getMyEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, enquiries });
});

// PATCH /api/enquiries/:id/status  (admin)
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'read', 'resolved'].includes(status)) {
    res.status(400); throw new Error('Invalid status value');
  }
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  res.json({ success: true, enquiry });
});

// DELETE /api/enquiries/:id  (admin)
const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) { res.status(404); throw new Error('Enquiry not found'); }
  res.json({ success: true, message: 'Enquiry deleted' });
});

module.exports = { createEnquiry, getEnquiries, getMyEnquiries, updateEnquiryStatus, deleteEnquiry };
