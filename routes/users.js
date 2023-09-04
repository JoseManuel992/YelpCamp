const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../model/user");
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


// User Profile

router.route("/profile/:user_id")
 .get(catchAsync(users.getUserProfile))



  // Edit User Profile
router.route("/profile/:user_id/edit")
  .get(catchAsync(users.renderEditProfileForm))
  .post(upload.single('avatar'), catchAsync(users.updateProfile));


//register a  new user

router.route("/register")
  .get(users.renderRegisterForm)
  .post(upload.single('avatar'), catchAsync(users.register))

//loging a user

router.route("/login")
  .get(users.renderLoginForm)
  .post(storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.login)

//logout a user

router.get('/logout', users.logout);

module.exports = router;
