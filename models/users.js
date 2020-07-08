const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: String,
  password: String,
  restaurantId: mongoose.Types.ObjectId,
  subscriptionActive: Boolean,
});

module.exports = mongoose.model("User", userSchema);
