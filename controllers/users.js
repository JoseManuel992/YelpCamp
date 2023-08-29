const User = require("../model/user");

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
