const express = require('express');
const {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAllSessions);
router.get('/:id', authMiddleware, getSessionById);
router.post('/', authMiddleware, createSession);
router.put('/:id', authMiddleware, updateSession);
router.delete('/:id', authMiddleware, deleteSession);

module.exports = router;
