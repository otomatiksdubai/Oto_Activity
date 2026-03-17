const express = require('express');
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllStaff);
router.get('/:id', authMiddleware, getStaffById);
router.post('/', authMiddleware, requireRole('admin'), createStaff);
router.put('/:id', authMiddleware, requireRole('admin'), updateStaff);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteStaff);

module.exports = router;
