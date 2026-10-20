const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, logout, toggleSavedPlot } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/\d/).withMessage('Password must contain at least one digit');

router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  passwordRules,
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  register
);

router.post('/login',
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.patch('/saved-plots', protect, toggleSavedPlot);

module.exports = router;
