const express=require('express');
const router=express.Router();
const authMiddleware=require('../middleware/authMiddleware');
const studentController=require('../controllers/studentController');


router.use(authMiddleware.protect);

router.post('/',authMiddleware.restrictTo('admin'),studentController.createStudent);
router.get('/',authMiddleware.restrictTo('admin'),studentController.getStudents);

router.route('/:id',authMiddleware.restrictTo('admin'))
.get(studentController.getStudentById)
.put(studentController.updateStudent)
.delete(studentController.deleteStudent);

router.get('/:classId',authMiddleware.restrictTo('admin'),studentController.getStudentsByClass);

router.get('/:sectionId',authMiddleware.restrictTo('admin'),studentController.getStudentsBySection);




module.exports= router;

