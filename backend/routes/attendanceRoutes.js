const express=require('express');
const router=express.Router();



const authMiddleware=require('../middleware/authMiddleware');

const attendanceController=require('../controllers/attendanceController');


router.use(authMiddleware.protect);

router.post('/',attendanceController.markAttendance);

router.get('/:studentId',attendanceController.getStudentAttendance);

router.get(
  '/me',
  auth.restrictTo('student'),
  attendanceController.getMyChildAttendance
);






module.exports=router;
