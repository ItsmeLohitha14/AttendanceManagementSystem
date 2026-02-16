const classController=require('../controllers/classController');
const authMiddleware=require('../middleware/authMiddleware');
const express=require('express');
const router=express.Router();

router.use(authMiddleware.protect);

router.post('/',authMiddleware.restrictTo('admin'),classController.createClass);
router.get('/',authMiddleware.restrictTo('admin'),classController.getClasses);
router.get('/branch/:branchId',authMiddleware.restrictTo('admin'),classController.getClassesByBranch);
router.route('/:id',authMiddleware.restrictTo('admin'))
.put(classController.updateClass)
.get(classController.getClassById)
.delete(classController.deleteClass);




module.exports=router
