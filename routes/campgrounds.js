const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../model/campground');

router.get('/', catchAsync(async (req, res) => {
  const perPage = 10; // Number of campgrounds per page
  const page = req.query.page || 1; // Get the page number from query parameters
  const skip = req.query.skip || ((perPage * page) - perPage); // Determine the number of documents to skip
  const isJson = req.query.isJson === 'true'; // Determine if it's a JSON request (for infinite scroll)
  const isPhoneSize = req.query.isPhoneSize === 'true';

  // Add this check to ensure skip is not less than 0
  if (skip < 0) {
    skip = 0;
  }

  try {
    // Fetch paginated campgrounds from the database
    const paginatedCampgrounds = await Campground.find({})
      .skip(Number(skip))
      .limit(perPage);

    // If it's a JSON request, just return the paginated campgrounds
    if (isJson) {
      return res.json({ campgrounds: paginatedCampgrounds });
    }

    const allCampgrounds = await Campground.find({}); // Fetch all campgrounds for the cluster map

    // Count all campgrounds to calculate total pages
    const campgroundsCount = await Campground.countDocuments();
    const totalPages = Math.ceil(campgroundsCount / perPage);

    res.render('campgrounds/index', {
      campgrounds: paginatedCampgrounds,
      allCampgrounds,
      currentPage: page,
      totalPages,
      isPhoneSize
    });
  } catch (err) {
    console.error('Error fetching paginated campgrounds:', err);
    // Handle the error appropriately, e.g., render an error page.
    res.render('error', { err });
  }
}));


router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;
