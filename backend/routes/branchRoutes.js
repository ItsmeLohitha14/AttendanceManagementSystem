const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);
router.post('/', authMiddleware.restrictTo('admin'), branchController.createBranch);
router.put('/:id', authMiddleware.restrictTo('admin'), branchController.updateBranch);
router.delete('/:id', authMiddleware.restrictTo('admin'), branchController.deleteBranch);


router.get('/', branchController.getBranches);
router.get('/:id', branchController.getBranchById);

module.exports = router;