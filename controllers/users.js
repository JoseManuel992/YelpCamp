const User = require("../model/user");


// Get User Profile
module.exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/campgrounds');
    }

    res.render('users/profile', { user });
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};

// Render Edit Profile Form
module.exports.renderEditProfileForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/campgrounds');
    }

    res.render('users/edit', { user });
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};

// Update User Profile
// module.exports.updateUserProfile = async (req, res) => {
//   try {
//     const { email, username } = req.body;
//     const user = await User.findByIdAndUpdate(req.params.user_id, { email, username }, { new: true });
//     req.flash('success', 'Profile updated successfully');
//     res.redirect(`/profile/${user._id}`);
//   } catch (err) {
//     req.flash('error', 'Something went wrong');
//     res.redirect('/campgrounds');
//   }
// };

// Update User Profile
module.exports.updateUserProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByIdAndUpdate(user_id, req.body, { new: true });

    req.flash("success", "Profile updated successfully!");
    res.redirect(`/profile/${user_id}`);
  } catch (err) {
    req.flash("error", "Failed to update profile.");
    res.redirect(`/profile/${user_id}`);
  }
};

//register a  new user

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
}

module.exports.register = async(req, res, next) => {
  try{
    const {email, username, password} = req.body;
    let avatarImage;

    if (req.file) {
        avatarImage = {
            url: req.file.path,
            filename: req.file.filename
        };
    } else {
        avatarImage = {
            url: '/images/default-user-image.png',
            filename: 'default-avatar'
        };
    }

    const user = new User({ email, username, avatar: avatarImage });
    const registerUser = await User.register(user, password);
    req.login(registerUser, err => {
      if(err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    })
  } catch(e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
}

//loging a user

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
}

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl || "/campgrounds");
}

//logout a user

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success', 'Goodbye!');
      res.redirect('/campgrounds');
  });
}
