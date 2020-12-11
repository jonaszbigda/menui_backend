const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: {
    type: String,
    maxlength: 128,
    required: true,
  },
  city: {
    type: String,
    maxlength: 128,
    required: true,
  },
  adress: {
    type: String,
    maxlength: 128,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  type: String,
  placesId: String,
  imgUrl: {
    type: String,
  },
  workingHours: {
    pn: String,
    wt: String,
    sr: String,
    cz: String,
    pt: String,
    sb: String,
    nd: String,
  },
  description: {
    type: String,
  },
  tags: {
    cardPayments: Boolean,
    petFriendly: Boolean,
    glutenFree: Boolean,
    vegan: Boolean,
    vegetarian: Boolean,
    alcohol: Boolean,
    delivery: Boolean,
  },
  links: {
    facebook: String,
    instagram: String,
    www: String,
  },
  phone: String,
  hidden: Boolean,
  subscriptionActive: Boolean,
  subscriptionStarted: Date,
  subscriptionDue: Date,
  categories: [String],
  lunchHours: String,
  lunchMenu: [
    {
      lunchSetName: String,
      lunchSetPrice: String,
      lunchSetDishes: [{
        dishId: mongoose.Types.ObjectId,
        quantity: String
      }],
    },
  ],
  dishes: [mongoose.Types.ObjectId],
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
