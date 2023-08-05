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
  const page = Math.max(req.query.page ? parseInt(req.query.page) : 1, 1); //Get the page number from query parameters and Ensure the page is at least 1
  const isPhoneSize = req.query.isPhoneSize === 'true';
  const isJson = req.query.isJson === 'true'; // Add this line

  // Check if the skip value is negative and redirect to the first page if so
  const skipValue = (perPage * page) - perPage;
  if (skipValue < 0) {
    return res.redirect('/?page=1'); // Redirect to the first page if skip is negative
  }



  try {
    // Fetch paginated campgrounds from the database
    const paginatedCampgrounds = await Campground.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage);

    const allCampgrounds = await Campground.find({}); // Fetch all campgrounds for the cluster map

    // Count all campgrounds to calculate total pages
    const campgroundsCount = await Campground.countDocuments();
    const totalPages = Math.ceil(campgroundsCount / perPage);

    // Check if the response should be in JSON format
    if (isJson) {
      return res.json({ campgrounds: paginatedCampgrounds, totalPages }); // Return JSON response
    }

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

}))


router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;
