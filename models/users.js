const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    maxlength: 64,
  },
  billing: {
    NIP: {
      type: String,
      maxlength: 20,
    },
    adress: {
      type: String,
      maxlength: 128,
    },
    companyName: {
      type: String,
      maxlength: 64,
    },
  },
  isRestaurant: {
    type: Boolean,
    required: true,
  },
  restaurants: [mongoose.Types.ObjectId],
  trialUsed: Boolean,
});

module.exports = mongoose.model("User", userSchema);
