const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dsb9ybqqc/image/upload/v1689885630/YelpCamp/syke1mchxfbkvgkjpjal.jpg

const ImageSchema = new Schema(
  {
    url: String,
    filename: String
  }
)

ImageSchema.virtual("thumbnail").get(function(){
  return this.url.replace("/upload", "/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
  title: String,
  images: [ ImageSchema ],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
  return  `
    <div class="popup-content">
      <div class="popup-left">
        <div class="popup-image-container">
          <img src="${this.images.length ? this.images[0].url : 'URL_TO_DEFAULT_IMAGE'}" alt="${this.title}" class="popup-image">
        </div>
      </div>
      <div class="popup-right">
        <strong><a href="/campgrounds/${this._id}" class="mapBox-popup-title">${this.title}</a></strong>
        <p class="mapBox-popup-descriptionText">${this.description.substring(0, 20)}...</p>
      </div>
    </div>`;
})


CampgroundSchema.post("findOneAndDelete", async function(doc){
 if(doc){
  await review.deleteMany({
    _id: {
      $in: doc.reviews
    }
  })
 }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
