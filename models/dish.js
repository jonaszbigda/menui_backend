const mongoose = require("mongoose");

const dishSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  category: String,
  price: Number,
  notes: String,
  imgUrl: String,
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
