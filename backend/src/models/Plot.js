const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema(
  {
    number:     { type: Number, required: true, unique: true },
    plotId:     { type: String, required: true, unique: true }, // e.g. "SLE-001"
    area:       { type: Number, required: true },               // sq yards
    dimensions: { type: String, required: true },               // e.g. "20x45 ft"
    facing:     { type: String, enum: ['East', 'West', 'North', 'South'], required: true },
    road:       { type: String, required: true },
    price:      { type: Number, required: true },
    status:     { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
    features:   [{ type: String }],
    col:        { type: Number },
    row:        { type: Number },
  },
  { timestamps: true }
);

plotSchema.index({ status: 1 });
plotSchema.index({ facing: 1 });
plotSchema.index({ area: 1 });

module.exports = mongoose.model('Plot', plotSchema);
