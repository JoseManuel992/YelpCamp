const {campgroundSchema, reviewSchema} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./model/campground");
const Review = require("./model/review");

module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash("error", "you must be signed in first!");
    return res.redirect("/login");
  }
  next();
}

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
  }
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  // console.log("err:", error)
  if(error) {
    console.log("middleware.validateCampground::err: ", error)
    const msg = error.details.map(element =>  element.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

module.exports.isAuthor = async(req, res, next) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)) {
    req.flash("error"," You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)) {
    req.flash("error"," You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error }  = reviewSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(element =>  element.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

module.exports.isCampgroundAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Middleware to check if the current user is the author of the reply
module.exports.isReplyAuthor  = async (req, res, next) => {
  const { id, reviewId, replyId } = req.params;
  const review = await Review.findById(reviewId).populate("replies");
  const reply = review.replies.find((r) => r._id.equals(replyId));

  if (req.user._id.equals(reply.author)) {
    return next();
  }
  req.flash("error", "You are not authorized to do that");
  res.redirect(`/campgrounds/${id}`);
}
