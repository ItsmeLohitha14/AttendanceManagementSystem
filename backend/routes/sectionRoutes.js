const sectionController=require('../controllers/sectionController');
const authMiddleware=require('../middleware/authMiddleware');
const express=require('express');

const router=express.Router();

router.use(authMiddleware.protect);

router.route('/')
.post(authMiddleware.restrictTo('admin'),sectionController.createSection)
.get(sectionController.getSections);



router.get('/class/:classId',sectionController.getSectionsByClass)
router.route('/:id')
.get(sectionController.getSectionById)
.put(sectionController.updateSection)
.delete(sectionController.deleteSection);

module.exports=router;