const mongoose = require("mongoose");

const dishSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  restaurantId: mongoose.Types.ObjectId,
  name: {
    type: String,
    maxlength: 128,
    required: true,
  },
  category: {
    type: String,
    maxlength: 64,
    required: true,
  },
  prices: {
    price1: {
      priceName: {
        type: String,
        maxlength: 60,
      },
      price: {
        type: String,
        maxlength: 20,
        required: true,
      },
    },
    price2: {
      priceName: {
        type: String,
        maxlength: 60,
      },
      price: {
        type: String,
        maxlength: 20,
      },
    },
    price3: {
      priceName: {
        type: String,
        maxlength: 60,
      },
      price: {
        type: String,
        maxlength: 20,
      },
    },
  },
  notes: {
    type: String,
    maxlength: 200,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  hidden: Boolean,
  weight: String,
  allergens: {
    gluten: Boolean,
    lactose: Boolean,
    soy: Boolean,
    eggs: Boolean,
    seaFood: Boolean,
    peanuts: Boolean,
    sesame: Boolean,
  },
  ingredients: String,
  glicemicIndex: String,
  kCal: String,
  vegan: Boolean,
  vegetarian: Boolean,
});

module.exports = mongoose.model("Dish", dishSchema);
