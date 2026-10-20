const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Plot = require('../models/Plot');

function validationGuard(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    const err = new Error('Validation failed');
    err.errors = errors.array();
    throw err;
  }
}

// GET /api/plots
const getPlots = asyncHandler(async (req, res) => {
  const { status, facing, minArea, maxArea, search, page = 1, limit = 100 } = req.query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (facing && facing !== 'all') filter.facing = facing;
  if (minArea || maxArea) {
    filter.area = {};
    if (minArea) filter.area.$gte = Number(minArea);
    if (maxArea) filter.area.$lte = Number(maxArea);
  }
  if (search) {
    const n = parseInt(search, 10);
    if (!isNaN(n)) {
      filter.$or = [{ number: n }, { plotId: new RegExp(search, 'i') }];
    } else {
      filter.plotId = new RegExp(search, 'i');
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [plots, total] = await Promise.all([
    Plot.find(filter).sort({ number: 1 }).skip(skip).limit(Number(limit)),
    Plot.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), plots });
});

// GET /api/plots/:plotId  (public — route param is named :plotId)
const getPlot = asyncHandler(async (req, res) => {
  const plot = await Plot.findOne({ plotId: req.params.plotId });
  if (!plot) { res.status(404); throw new Error('Plot not found'); }
  res.json({ success: true, plot });
});

// PATCH /api/plots/:id/status  (admin — :id is the MongoDB _id)
const updatePlotStatus = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { status } = req.body;
  const plot = await Plot.findById(req.params.id);
  if (!plot) { res.status(404); throw new Error('Plot not found'); }
  plot.status = status;
  await plot.save();
  res.json({ success: true, plot });
});

// POST /api/plots  (admin)
const createPlot = asyncHandler(async (req, res) => {
  validationGuard(req, res);
  const { number, plotId, area, dimensions, facing, road, price, status, features, row, col } = req.body;
  const plot = await Plot.create({ number, plotId, area, dimensions, facing, road, price, status, features, row, col });
  res.status(201).json({ success: true, plot });
});

// DELETE /api/plots/:id  (admin — :id is the MongoDB _id)
const deletePlot = asyncHandler(async (req, res) => {
  const plot = await Plot.findByIdAndDelete(req.params.id);
  if (!plot) { res.status(404); throw new Error('Plot not found'); }
  res.json({ success: true, message: 'Plot deleted' });
});

module.exports = { getPlots, getPlot, updatePlotStatus, createPlot, deletePlot };
