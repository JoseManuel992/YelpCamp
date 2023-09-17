const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
  text: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  replies: [replySchema], // Array of reply objects
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically for reviews
});

module.exports = mongoose.model("Review", reviewSchema);
