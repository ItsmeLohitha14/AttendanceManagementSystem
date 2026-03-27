const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

router.use(authMiddleware.protect);

router.post('/', authMiddleware.restrictTo('admin'), studentController.createStudent);
router.get('/', authMiddleware.restrictTo('admin'), studentController.getStudents);

router.get('/class/:classId', authMiddleware.restrictTo('admin'), studentController.getStudentsByClass);
router.get('/section/:sectionId', authMiddleware.restrictTo('admin'), studentController.getStudentsBySection);

// Dynamic routes - these should come last
router.route('/:id')
  .get(authMiddleware.restrictTo('admin'), studentController.getStudentById)
  .put(authMiddleware.restrictTo('admin'), studentController.updateStudent)
  .delete(authMiddleware.restrictTo('admin'), studentController.deleteStudent);

module.exports = router;