const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../model/campground');

router.route('/')
  .get(catchAsync(async (req, res) => {
    const page = Math.max(req.query.page ? parseInt(req.query.page) : 1, 1); // Get page number from query parameters
    const limit = 10; // Number of campgrounds per page
    const skip = (page - 1) * limit; // Calculate the number of results to skip

    // Fetch paginated campgrounds from the database
    const campgrounds = await Campground.find().skip(skip).limit(limit);

    // Fetch all campgrounds for the cluster map
    const allCampgrounds = await Campground.find();

    // Count all campgrounds to calculate total pages
    const totalCampgrounds = await Campground.countDocuments();
    const totalPages = Math.ceil(totalCampgrounds / limit);

    // If it's a phone size, and isJson is true, return JSON response
    const isPhoneSize = req.query.isPhoneSize === 'true';
    const isJson = req.query.isJson === 'true';
    if (isPhoneSize && isJson) {
      return res.json({ campgrounds, totalPages });
    }

    // Render the index page with paginated campgrounds
    res.render('campgrounds/index', { campgrounds, allCampgrounds, currentPage: page, totalPages, isPhoneSize });
  }))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;
