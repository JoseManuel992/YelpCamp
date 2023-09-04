const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    url: {
      type: String,
      default: '../images/default-user-image.png'  // path for the default image
    },
    filename: String
  },
  birthDate: Date, // Using the Date type
  work: String,
  funFact: String,
  favoriteSong: String,
  uselessSkill: String,
  school: String,
  spendingHabit: String,
  biographyTitle: String,
  obsession: String,
  languages: String,
  location: String,
  pets: String
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);
