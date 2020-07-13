const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  restaurantId: mongoose.Types.ObjectId,
  subscriptionActive: {
    type: Boolean,
    required: true,
  },
  subscriptionDue: Date,
});

module.exports = mongoose.model("User", userSchema);
