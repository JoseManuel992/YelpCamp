const Campground = require("../model/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

// we use here mongoose for validateObjectId
const mongoose = require('mongoose');


//index

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", {campgrounds})
}

//moved perPage in the general scope inside this file
// so paginateCampgrounds and searchCampgrounds can use it!
const perPage = 10;

const paginateCampgrounds = async (req, res) => {
  const page = req.query.page || 1;
  const skip = req.query.skip || ((perPage * page) - perPage);
  const isJson = req.query.isJson === 'true';
  const isPhoneSize = req.query.isPhoneSize === 'true';

  if (skip < 0) {
      skip = 0;
  }

  const paginatedCampgrounds = await Campground.find({})
      .skip(Number(skip))
      .limit(perPage);

  const allCampgrounds = await Campground.find({});
  const campgroundsCount = await Campground.countDocuments();
  const totalPages = Math.ceil(campgroundsCount / perPage);

  // In paginateCampgrounds
  if (isJson) {
    return { responseAsJson: true, data: { campgrounds: paginatedCampgrounds } };
  }


  return {
      campgrounds: paginatedCampgrounds,
      allCampgrounds,
      currentPage: page,
      totalPages,
      perPage,
      isPhoneSize
  };
};

module.exports.listCampgroundsPaginationAndInfiniteScroll = async (req, res) => {
  try {
    const context = await paginateCampgrounds(req, res);
    if (context.responseAsJson) {
      return res.json(context.data);
    }
      res.render('campgrounds/index', context);
  } catch (err) {
      console.error('Error fetching paginated campgrounds:', err);
      res.render('error', { err });
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.searchCampgrounds = async (req, res, next) => {
  if (req.query.query) {
    try {
        const regex = new RegExp(escapeRegex(req.query.query), 'i');
        const campgrounds = await Campground.find({
            $or: [
                { title: regex },
                { location: regex }
            ]
        });

        // NEW: Calculate the number of pages based on search results
        const totalPages = Math.ceil(campgrounds.length / perPage);

      if (campgrounds.length > 0) {
          const context = await paginateCampgrounds(req, res);
          context.campgrounds = campgrounds;
          context.totalPages = totalPages; // Overwrite totalPages from pagination with search results count
          return res.render("campgrounds/index", context);
      }
    } catch (err) {
      console.error(err);
      return next(err); // Passing the error to the error handler
    }

      // If there's no query or no matching campgrounds, fallback to pagination logic
      try {
        const context = await paginateCampgrounds(req, res);
        res.render('campgrounds/index', context);
    } catch (err) {
        console.error('Error fetching paginated campgrounds:', err);
        next(err);
    }
  }


};



//create new

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry
  campground.images = req.files.map( f => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  await campground.save();
  // console.log(campground);
  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`)
}

//show

module.exports.showCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } },  // Sort by creation date in descending order
        populate: {
          path: "author"
        }
    }).populate("author");

    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }

    // Calculate average rating
    let averageRating = 0;
    if (campground.reviews.length > 0) {
      let totalRating = 0;
      for (let review of campground.reviews) {
        totalRating += review.rating;
      }
      averageRating = totalRating / campground.reviews.length;
    }

    res.render("campgrounds/show", { campground, averageRating, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/campgrounds");
  }
}


//edit

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  if(!campground){
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", {campground});
}

module.exports.updateCampground = async (req, res) => {
  const {id} = req.params;
  // console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  const imgs = req.files.map( f => ({ url: f.path, filename: f.filename }))
  campground.images.push(...imgs);
  await campground.save()
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages} } } } )
    // console.log(campground)
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`)
}

//delete

module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Sucessfully delete campground!");
  res.redirect("/campgrounds");
}

/**
 * Middleware to validate the ObjectId format in the request parameters.
 * If the provided 'id' parameter isn't a valid MongoDB ObjectId,
 * an error message is flashed and the user is redirected to "/campgrounds".
 * Otherwise, the next middleware or route handler is executed.
*/

module.exports.validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid campground ID format.");
      return res.redirect("/campgrounds");
  }
  next();
};
