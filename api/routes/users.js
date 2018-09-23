const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth');
const userController = require('../controllers/user');

/* GET users listing. */
router.post('/', checkAuth, userController.getUsers);

router.post('/signup',userController.registerUsers);

router.post('/login',userController.loginUsers);

router.post('/forgot-password', userController.forgotPassword);

router.patch('/reset-password/', userController.updatePassword);

module.exports = router;