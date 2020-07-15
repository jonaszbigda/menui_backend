const mongoose = require("mongoose");

const dishSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
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
  price: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    maxlength: 128,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  hidden: Boolean,
  weight: Number,
  allergens: {
    gluten: Boolean,
    lactose: Boolean,
    soy: Boolean,
    eggs: Boolean,
    seaFood: Boolean,
    peanuts: Boolean,
    sesame: Boolean,
  },
  vegan: Boolean,
  vegetarian: Boolean,
});

module.exports = mongoose.model("Dish", dishSchema);
