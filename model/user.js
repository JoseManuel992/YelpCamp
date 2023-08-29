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
  }
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);
