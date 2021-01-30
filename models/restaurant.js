const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: {
    type: String,
    maxlength: 64,
    required: true,
  },
  city: {
    type: String,
    maxlength: 64,
    required: true,
  },
  adress: {
    type: String,
    maxlength: 64,
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
  type: {
    type: String,
    maxlength: 64,
    required: true
  },
  placesId: {
    type: String,
    maxlength: 128
  },
  imgUrl: {
    type: String,
    maxlength: 128
  },
  workingHours: {
    pn: {
      type: String,
      maxlength: 24
    },
    wt: {
      type: String,
      maxlength: 24
    },
    sr: {
      type: String,
      maxlength: 24
    },
    cz: {
      type: String,
      maxlength: 24
    },
    pt: {
      type: String,
      maxlength: 24
    },
    sb: {
      type: String,
      maxlength: 24
    },
    nd: {
      type: String,
      maxlength: 24
    },
  },
  description: {
    type: String,
    maxlength: 400
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
    facebook: {
      type: String,
      maxlength: 128
    },
    instagram: {
      type: String,
      maxlength: 128
    },
    www: {
      type: String,
      maxlength: 128
    },
  },
  phone: {
    type: String,
    maxlength: 24
  },
  hidden: Boolean,
  subscriptionActive: Boolean,
  subscriptionStarted: Date,
  subscriptionDue: Date,
  indexed: Date,
  categories: [String],
  lunchHours: {
    type: String,
    maxlength: 24
  },
  lunchMenu: [
    {
      lunchSetName: {
        type: String,
        maxlength: 30
      },
      lunchSetPrice: Number,
      lunchSetDishes: [{
        dishId: mongoose.Types.ObjectId,
        quantity: Number
      }],
    },
  ],
  dishes: [mongoose.Types.ObjectId],
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
