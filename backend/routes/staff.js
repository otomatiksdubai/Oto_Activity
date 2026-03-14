const express = require('express');
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllStaff);
router.get('/:id', authMiddleware, getStaffById);
router.post('/', authMiddleware, createStaff);
router.put('/:id', authMiddleware, updateStaff);
router.delete('/:id', authMiddleware, deleteStaff);

module.exports = router;
