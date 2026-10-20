const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true, maxlength: 100 },
    email:         { type: String, trim: true, lowercase: true },
    mobile:        { type: String, required: true, match: /^[6-9]\d{9}$/ },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String },
    message:       { type: String, maxlength: 1000 },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:        { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

visitSchema.index({ userId: 1 });
visitSchema.index({ preferredDate: 1 });
visitSchema.index({ status: 1 });

module.exports = mongoose.model('Visit', visitSchema);
