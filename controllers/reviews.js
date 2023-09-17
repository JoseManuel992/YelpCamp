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

  // Log the review details to the terminal
  console.log("New Review Details:");
  console.log("Author:", req.user.username);
  console.log("Rating:", review.rating);
  console.log("Body:", review.body);

  res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  try {
    const review = await Review.findById(reviewId).populate('author');

    if (!review) {
      // Handle review not found, e.g., return a 404 response.
      req.flash("error", "Review not found!");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    res.render('campgrounds/show', { review, replyAuthor: req.user }); // Pass the reply author (current user) here
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/campgrounds");
  }
};



module.exports.deleteReview = async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Sucessfully delete review!");
  res.redirect(`/campgrounds/${id}`);
}


module.exports.createReply = async (req, res) => {
  const { id, reviewId } = req.params;
  let campground;

  try {
    campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);

    if (!campground || !review) {
      req.flash("error", "Campground or Review not found");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    const { text } = req.body.reply; // Retrieve the text from req.body.reply
    const currentUser = req.user; // Assuming you have a middleware that sets req.user

    // Create a new reply
    const reply = {
      text: text,
      author: currentUser._id, // Set author to the ObjectId of the logged-in user
    };
    console.log("Reply Author:", req.user.username); // Add this console.log

    review.replies.push(reply);
    await review.save();

    req.flash("success", "Created a new reply!");

    console.log("New Reply Details:");
    console.log("Author:", currentUser.username); // Use currentUser.username
    console.log("Reply Text:", text);

    res.redirect(`/campgrounds/${campground._id}`);
  } catch (error) {
    console.error(error);
    console.log("An error occurred while creating the reply");
    req.flash("error", "An error occurred while creating the reply");

    if (campground) {
      res.redirect(`/campgrounds/${campground._id}`);
    } else {
      res.redirect("/campgrounds");
    }
  }
};

module.exports.deleteReply = async (req, res) => {
  const { id, reviewId, replyId } = req.params;

  try {
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);

    if (!campground || !review) {
      // Handle campground or review not found
      req.flash("error", "Campground or Review not found");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    // Find the reply to delete by its _id
    const replyToDelete = review.replies.find((reply) => reply._id.equals(replyId));

    if (!replyToDelete) {
      // Handle reply not found
      req.flash("error", "Reply not found");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    // Check if the current user is the author of the reply or the campground
    if (req.user._id.equals(replyToDelete.author) || req.user._id.equals(campground.author)) {
      // Remove the reply from the review's replies array
      review.replies = review.replies.filter((reply) => !reply._id.equals(replyId));
      await review.save();

      req.flash("success", "Successfully deleted reply!");
      res.redirect(`/campgrounds/${campground._id}`);
    } else {
      req.flash("error", "You are not authorized to delete this reply.");
      res.redirect(`/campgrounds/${campground._id}`);
    }
  } catch (error) {
    console.error(error);
    req.flash("error", "An error occurred while deleting the reply");
    res.redirect(`/campgrounds/${campground._id}`);
  }
};
