const mongoose = require("mongoose");
const cities = require("./cities")
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../model/campground")

mongoose.connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo Connection Open!!!")
  })
  .catch(err => {
    console.log("Oh no Mongo Connection Error!!!!")
    console.log(err)
  })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for(let i = 0; i < 300; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //YOUR USER ID
      author: "64bb2323183583f7c70bd8e4",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestias sequi ex amet sint, maxime eaque sapiente vitae assumenda fugiat, eius dolor voluptas inventore suscipit rerum fuga deleniti voluptatibus blanditiis dolore.",
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images:
      [
        {
          url: 'https://res.cloudinary.com/dsb9ybqqc/image/upload/v1689857991/YelpCamp/lpb2i4jbb152dpymiwyw.jpg',
          filename: 'YelpCamp/lpb2i4jbb152dpymiwyw'
        },
        {
          url: 'https://res.cloudinary.com/dsb9ybqqc/image/upload/v1689857986/YelpCamp/ud0wj7i7zhm2zefolyos.jpg',
          filename: 'YelpCamp/ud0wj7i7zhm2zefolyos'
        }
      ]
    })
    await camp.save()
  }
}


seedDB().then(() => {
  mongoose.connection.close()
})
