const router = require('express').Router();
const { getGallery, uploadGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { upload } = require('../config/cloudinary');

router.get('/', getGallery);
router.post('/', protect, adminOnly, upload.single('image'), uploadGalleryItem);
router.delete('/:id', protect, adminOnly, deleteGalleryItem);

module.exports = router;
