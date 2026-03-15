const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', authMiddleware, courseController.getAllCourses);
router.post('/', authMiddleware, requireRole('admin'), courseController.createCourse);
router.delete('/:id', authMiddleware, requireRole('admin'), courseController.deleteCourse);

module.exports = router;
