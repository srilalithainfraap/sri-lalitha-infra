const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { getPlots, getPlot, updatePlotStatus, createPlot, deletePlot } = require('../controllers/plotController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getPlots);
router.get('/:plotId', getPlot);

router.post('/',
  protect, adminOnly,
  body('number').notEmpty().withMessage('Plot number is required'),
  body('plotId').notEmpty().withMessage('Plot ID is required'),
  body('area').isFloat({ min: 1 }).withMessage('Area must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('status').isIn(['available', 'reserved', 'sold']).withMessage('Invalid status'),
  createPlot
);

router.patch('/:id/status',
  protect, adminOnly,
  body('status').isIn(['available', 'reserved', 'sold']).withMessage('Invalid status'),
  updatePlotStatus
);

router.delete('/:id', protect, adminOnly, deletePlot);

module.exports = router;
