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
  firstname: {
    type: String,
    maxlength: 24,
  },
  lastname: {
    type: String,
    maxlength: 24,
  },
  login: {
    type: String,
    maxlength: 64
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
  isRestaurant: Boolean,
  restaurants: [mongoose.Types.ObjectId],
  trialUsed: Boolean,
  preferences: {
    excludeAllergens: [String],
    vegetarian: Boolean,
    vegan: Boolean,
  },
  favoriteRestaurants: [mongoose.Types.ObjectId],
  photos: [mongoose.Types.ObjectId]
});

module.exports = mongoose.model("User", userSchema);
