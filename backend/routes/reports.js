const express = require('express');
const { 
  getSalesReport, 
  saveReport, 
  getReportHistory 
} = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', authMiddleware, requireRole('admin', 'staff'), getSalesReport);
router.post('/', authMiddleware, requireRole('admin'), saveReport);
router.get('/history', authMiddleware, requireRole('admin', 'staff'), getReportHistory);

module.exports = router;
