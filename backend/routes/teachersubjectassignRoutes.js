const express=require('express');
const router=express.Router();

const tsaController=require('../controllers/TeacherSubjectAssignController');
const authMiddleware=require('../middleware/authMiddleware');


router.use(authMiddleware.protect);

router.route('/',authMiddleware.restrictTo('admin'))
.post(tsaController.createAssignment)
.get(tsaController.getAssignments)

router.delete('/:id',authMiddleware.restrictTo('admin'),tsaController.deleteAssignment);

router.get('/me',tsaController.getMyAssignments);

router.get('/:teacherId',tsaController.getAssignmentsByTeacher);

module.exports=router;


