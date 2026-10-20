const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true, maxlength: 100 },
    email:      { type: String, trim: true, lowercase: true },
    mobile:     { type: String, required: true, match: /^[6-9]\d{9}$/ },
    message:    { type: String, required: true, maxlength: 2000 },
    plotId:     { type: String },
    plotNumber: { type: Number },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:     { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1 });
enquirySchema.index({ userId: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
