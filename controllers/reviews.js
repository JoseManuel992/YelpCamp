const Campground = require("../model/campground");
const Review = require("../model/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const review = await Review.findById(reviewId);
  if (!review) {
      // Handle review not found, e.g., return a 404 response.
      req.flash("error", "Review not found!");
      return res.redirect(`/campgrounds/${campground._id}`);
  }
  res.render('reviews/show', { review });
};


module.exports.deleteReview = async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Sucessfully delete review!");
  res.redirect(`/campgrounds/${id}`);
}
