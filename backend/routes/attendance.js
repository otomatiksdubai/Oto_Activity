const express = require('express');
const {
  getAllAttendance,
  getAttendanceBySession,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllAttendance);
router.get('/session/:sessionId', authMiddleware, getAttendanceBySession);
router.get('/student/:studentId', authMiddleware, getAttendanceByStudent);
router.post('/mark', authMiddleware, requireRole('admin', 'trainer'), markAttendance);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), updateAttendance);
router.delete('/:id', authMiddleware, requireRole('admin', 'trainer'), deleteAttendance);

module.exports = router;
