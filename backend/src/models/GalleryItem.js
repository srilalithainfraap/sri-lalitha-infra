const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true, maxlength: 200 },
    caption:    { type: String, trim: true, maxlength: 500 },
    category:   { type: String, required: true, trim: true, maxlength: 50 },
    imageUrl:   { type: String, required: true },
    publicId:   { type: String, required: true },   // Cloudinary public_id for deletion
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
