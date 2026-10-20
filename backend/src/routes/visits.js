const router = require('express').Router();
const { body } = require('express-validator');
const { createVisit, getVisits, getMyVisits, updateVisitStatus } = require('../controllers/visitController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { optionalAuth } = require('../middleware/optionalAuth');

const visitValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('preferredDate').isISO8601().withMessage('Provide a valid date').toDate(),
  body('preferredTime').optional({ checkFalsy: true }),
];

// Public — optionally authenticated
router.post('/', optionalAuth, visitValidation, createVisit);

// Authenticated user
router.get('/mine', protect, getMyVisits);

// Admin
router.get('/', protect, adminOnly, getVisits);
router.patch('/:id/status', protect, adminOnly, updateVisitStatus);

module.exports = router;
