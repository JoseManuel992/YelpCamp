const express = require("express");
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor, isCampgroundAuthor} = require("../middleware");
const Campground = require("../model/campground");
const Review = require("../model/review");
const reviews = require("../controllers/reviews");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

//Reviews

//create
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.get('/:reviewId', catchAsync(reviews.showReview));

//delete
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;

//Replies

// Create a new route for handling replies to reviews
router.post("/:reviewId/replies", isLoggedIn, isCampgroundAuthor, catchAsync(reviews.createReply));

//delete the reply
router.delete("/:reviewId/replies/:replyId", isLoggedIn, isCampgroundAuthor, catchAsync(reviews.deleteReply));
