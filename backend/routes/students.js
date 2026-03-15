const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  levelUp
} = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllStudents);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, createStudent);
router.put('/:id', authMiddleware, updateStudent);
router.put('/:id/level-up', authMiddleware, levelUp);
router.delete('/:id', authMiddleware, deleteStudent);

module.exports = router;
