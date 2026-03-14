const express = require('express');
const {
  getAllAttendance,
  getAttendanceBySession,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllAttendance);
router.get('/session/:sessionId', authMiddleware, getAttendanceBySession);
router.get('/student/:studentId', authMiddleware, getAttendanceByStudent);
router.post('/mark', authMiddleware, markAttendance);
router.put('/:id', authMiddleware, updateAttendance);
router.delete('/:id', authMiddleware, deleteAttendance);

module.exports = router;
