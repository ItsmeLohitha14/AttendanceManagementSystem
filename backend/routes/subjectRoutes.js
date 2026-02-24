const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const subjectController = require('../controllers/subjectController');

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Public/Admin routes
router.route('/')
  .post(authMiddleware.restrictTo('admin'), subjectController.createSubject)
  .get(subjectController.getSubjects);

router.route('/:id')
  .get(subjectController.getSubjectById)
  .put(authMiddleware.restrictTo('admin'), subjectController.updateSubject)
  .delete(authMiddleware.restrictTo('admin'), subjectController.deleteSubject);

module.exports = router;