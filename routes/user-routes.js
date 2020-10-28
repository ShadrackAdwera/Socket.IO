const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.post(
  '/login',
  [check('email').normalizeEmail().isEmail()],
  userController.login
);
router.post(
  '/sign-up',
  [
    check('name').isLength({ min: 3 }),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  userController.signUp
);

module.exports = router
