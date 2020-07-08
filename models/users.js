const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  id: mongoose.Types.ObjectId,
  email: String,
  password: String,
  restaurantId: mongoose.Types.ObjectId,
  subscriptionActive: Boolean,
});

module.exports = mongoose.model("User", userSchema);
