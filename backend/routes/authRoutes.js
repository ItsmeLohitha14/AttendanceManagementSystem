const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware=require('../middleware/authMiddleware')

router.post('/login', authController.login);
router.post('/register', authController.register); // admin only later
router.get('/users',authMiddleware.protect,authMiddleware.restrictTo('admin'),authController.getUsers);



module.exports = router;
