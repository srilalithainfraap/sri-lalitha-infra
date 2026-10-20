const router = require('express').Router();
const { getAdminStats, getUserStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/user', protect, getUserStats);

module.exports = router;
