const express=require('express');
const router=express.Router();

const authMiddleware=require('../middleware/authMiddleware');
const subjectController=require('../controllers/subjectController');

router.use(authMiddleware.protect);

router.route('/',authMiddleware.restrictTo('admin'))
.post(subjectController.createSubject)
.get(subjectController.getSubjects)

router.route('/:id',authMiddleware.restrictTo('admin'))
.get(subjectController.getSubjectById)
.put(subjectController.updateSubject)
.delete(subjectController.deleteSubject)


module.exports=router;