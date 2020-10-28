const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User-model');

const HttpError = require('../models/error-model');

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  let foundUser;
  let hashedPassword;
  let tokens;
  const inputError = validationResult(req);
  if (!inputError.isEmpty()) {
    return next(new HttpError('Check your inputs son', 422));
  }

  try {
    foundUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Internal server error', 500));
  }
  if (foundUser) {
    return next(new HttpError('User exists', 422));
  }

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Auth failed', 401));
  }
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    items: [],
  });
  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Auth failed', 500));
  }
  try {
    tokens = jwt.sign({ userId: newUser.id, email: email }, 'fucc_them_kids', {
      expiresIn: '1h',
    });
  } catch (error) {
    return next(new HttpError('Auth failed!', 500));
  }
  res
    .status(201)
    .json({
      messsage: 'Sign Up Successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: tokens,
      },
    });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let foundUser;
  let isPassword;
  let token;

  const inputError = validationResult(req);
  if (!inputError.isEmpty()) {
    return next(new HttpError('Check your inputs son', 422));
  }

  try {
    foundUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Server error', 500));
  }
  if (!foundUser) {
    return next(new HttpError('Email does not exist', 422));
  }

  try {
    isPassword = await bcrypt.compare(password, foundUser.password);
  } catch (error) {
    return next(new HttpError('Auth fail', 500));
  }
  if (!isPassword) {
    return next(new HttpError('Invalid password', 422));
  }
  try {
    token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      'fucc_them_kids',
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('Auth fail', 500));
  }
  res
    .status(200)
    .json({
      message: 'Sign in successful',
      user: { id: foundUser.id, email: foundUser.email, token: token },
    });
};

exports.signUp = signUp;
exports.login = login;
