const express = require('express');
const {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllSessions);
router.get('/:id', authMiddleware, getSessionById);
router.post('/', authMiddleware, requireRole('admin', 'trainer'), createSession);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), updateSession);
router.delete('/:id', authMiddleware, requireRole('admin', 'trainer'), deleteSession);

module.exports = router;
