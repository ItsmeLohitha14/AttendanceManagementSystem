const express = require('express');
const router = express.Router();
const teacherController=require('../controllers/teacherController');
const authMiddleware=require('../middleware/authMiddleware')

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));
router.route('/')
.get(teacherController.getTeachers)
.post(teacherController.CreateTeacher);

router.route('/:id')
.get(teacherController.getOneTeacher)
.put(teacherController.updateTeacher)
.delete(teacherController.deleteTeacher);



module.exports=router;
