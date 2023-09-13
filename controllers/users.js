const User = require("../model/user");
const { cloudinary } = require("../cloudinary");


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

    res.render('users/editProfile', { user });
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};

// Update User Profile
module.exports.updateProfile = async (req, res) => {

  try {
    console.log('Update Profile Controller');

    const { user_id } = req.params;
    console.log('User ID:', user_id);

    let {
      username,
      email,
      birthDate,
      work,
      funFact,
      favoriteSong,
      uselessSkill,
      school,
      spendingHabit,
      biographyTitle,
      obsession,
      languages,
      location,
      pets,
      aboutYou
    } = req.body.user;

    const user = await User.findByIdAndUpdate(user_id, { username, email });


    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/campgrounds');
    }

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Birth Date:', birthDate);
    console.log('Work:', work);
    console.log('Fun Fact:', funFact);
    console.log('Favorite Song:', favoriteSong);
    console.log('Useless Skill:', uselessSkill);
    console.log('School:', school);
    console.log('Spending Habit:', spendingHabit);
    console.log('Biography Title:', biographyTitle);
    console.log('Obsession:', obsession);
    console.log('Languages:', languages);
    console.log('Location:', location);
    console.log('Pets:', pets);
    console.log('About you:', aboutYou);

    username = username.trim();
    email = email.trim();
    user.birthDate = birthDate;
    user.work = work;
    user.funFact = funFact;
    user.favoriteSong = favoriteSong;
    user.uselessSkill = uselessSkill;
    user.school = school;
    user.spendingHabit = spendingHabit;
    user.biographyTitle = biographyTitle;
    user.obsession = obsession;
    user.languages = languages;
    user.location = location;
    user.pets = pets;
    user.aboutYou = aboutYou; // Update the 'aboutYou' field


    console.log('User Updated:', user);

    // Update avatar if provided
    if (req.file) {
      user.avatar = { url: req.file.path, filename: req.file.filename };
      console.log('Avatar Updated:', user.avatar);

    }

    await user.save();

    console.log('User Saved:', user);


    req.flash('success', 'Profile updated successfully');
    res.redirect(`/profile/${user._id}`); // Use user._id here
  } catch (err) {
    req.flash('error', 'Error updating profile');
    res.redirect(`/profile/${user._id}/edit`);
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
