const express = require("express");
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
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
