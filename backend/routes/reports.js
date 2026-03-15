const express = require('express');
const { 
  getSalesReport, 
  saveReport, 
  getReportHistory 
} = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All report routes require admin access essentially, but we use authMiddleware and check role if needed.
// For now, let's just use authMiddleware and restrict in the UI, or add a role check here.

const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

router.get('/sales', authMiddleware, adminOnly, getSalesReport);
router.post('/', authMiddleware, adminOnly, saveReport);
router.get('/history', authMiddleware, adminOnly, getReportHistory);

module.exports = router;
