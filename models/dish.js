const mongoose = require("mongoose");

const dishSchema = mongoose.Schema({
  id: mongoose.Types.ObjectId,
  name: String,
  category: String,
  price: Number,
  notes: String,
  imgUrl: String,
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
