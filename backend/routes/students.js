const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  levelUp
} = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, requireRole('admin', 'trainer'), createStudent);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), updateStudent);
router.put('/:id/level-up', authMiddleware, requireRole('admin', 'trainer'), levelUp);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteStudent);

module.exports = router;
