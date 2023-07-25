const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../model/user");
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");

//register a  new user

router.route("/register")
  .get(users.renderRegisterForm)
  .post(catchAsync(users.register))

//loging a user

router.route("/login")
  .get(users.renderLoginForm)
  .post(storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.login)

//logout a user

router.get('/logout', users.logout);

module.exports = router;
