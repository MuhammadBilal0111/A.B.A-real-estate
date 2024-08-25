const express = require('express');
const userController = require('../Controller/authController');
const router = express.Router();

router.route('/login').post(userController.login); // login route
router.route('/signup').post(userController.signUp); // sign-up route
router.route('/protect').post(userController.protect);
router.route('/forgetpassword').post(userController.forgetPassword); // forget password
router.route('/resetPassword').get(userController.resetPassword);
router.route('/resetPassword/:token').get(userController.resetPassword); // reset password

module.exports = router;