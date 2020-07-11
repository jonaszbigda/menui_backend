const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: String,
  password: String,
  restaurantId: mongoose.Types.ObjectId,
  subscriptionActive: Boolean,
  subscriptionDue: Date,
});

module.exports = mongoose.model("User", userSchema);
