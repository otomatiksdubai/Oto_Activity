const express = require('express');
const {
  getAllFees,
  getFeesByStudent,
  createFee,
  recordPayment,
  updateFee,
  deleteFee
} = require('../controllers/feeController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllFees);
router.get('/student/:studentId', authMiddleware, getFeesByStudent);
router.post('/', authMiddleware, requireRole('admin'), createFee);
router.post('/:id/payment', authMiddleware, requireRole('admin'), recordPayment);
router.put('/:id', authMiddleware, requireRole('admin'), updateFee);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteFee);

module.exports = router;
