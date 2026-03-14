const express = require('express');
const {
  getAllFees,
  getFeesByStudent,
  createFee,
  recordPayment,
  updateFee,
  deleteFee
} = require('../controllers/feeController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllFees);
router.get('/student/:studentId', authMiddleware, getFeesByStudent);
router.post('/', authMiddleware, createFee);
router.post('/:id/payment', authMiddleware, recordPayment);
router.put('/:id', authMiddleware, updateFee);
router.delete('/:id', authMiddleware, deleteFee);

module.exports = router;
