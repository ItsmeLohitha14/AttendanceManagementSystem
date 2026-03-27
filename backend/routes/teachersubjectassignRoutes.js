const express=require('express');
const router=express.Router();

const tsaController=require('../controllers/TeacherSubjectAssignController');
const authMiddleware=require('../middleware/authMiddleware');


router.use(authMiddleware.protect);

// Admin only routes
router.post('/', authMiddleware.restrictTo('admin'), tsaController.createAssignment);
router.get('/', authMiddleware.restrictTo('admin'), tsaController.getAssignments);

// Delete assignment (admin only)
router.delete('/:id', authMiddleware.restrictTo('admin'), tsaController.deleteAssignment);

// Teacher specific routes
router.get('/me', tsaController.getMyAssignments);
router.get('/:teacherId', tsaController.getAssignmentsByTeacher);

module.exports = router;


