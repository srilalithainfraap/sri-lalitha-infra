const router = require('express').Router();
const { body } = require('express-validator');
const { createEnquiry, getEnquiries, getMyEnquiries, updateEnquiryStatus, deleteEnquiry } = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { optionalAuth } = require('../middleware/optionalAuth');

const enquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

// Public — optionally authenticated (userId attached if token present)
router.post('/', optionalAuth, enquiryValidation, createEnquiry);

// Authenticated user
router.get('/mine', protect, getMyEnquiries);

// Admin
router.get('/', protect, adminOnly, getEnquiries);
router.patch('/:id/status', protect, adminOnly, updateEnquiryStatus);
router.delete('/:id', protect, adminOnly, deleteEnquiry);

module.exports = router;
