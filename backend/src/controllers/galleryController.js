const asyncHandler = require('express-async-handler');
const GalleryItem = require('../models/GalleryItem');
const { cloudinary } = require('../config/cloudinary');

// Upload buffer to Cloudinary and return { secure_url, public_id }
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'srilalithainfra/gallery',
        resource_type: 'image',
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET /api/gallery  (public)
const getGallery = asyncHandler(async (_req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json({ success: true, items });
});

// POST /api/gallery  (admin, after multer memoryStorage middleware)
const uploadGalleryItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const { title, caption, category } = req.body;
  if (!title?.trim()) { res.status(400); throw new Error('Title is required'); }
  if (!category?.trim()) { res.status(400); throw new Error('Category is required'); }

  const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

  const item = await GalleryItem.create({
    title:      title.trim(),
    caption:    caption?.trim() || '',
    category:   category.trim(),
    imageUrl:   result.secure_url,
    publicId:   result.public_id,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, item });
});

// DELETE /api/gallery/:id  (admin)
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) { res.status(404); throw new Error('Gallery item not found'); }

  try {
    await cloudinary.uploader.destroy(item.publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Gallery item deleted' });
});

module.exports = { getGallery, uploadGalleryItem, deleteGalleryItem };
