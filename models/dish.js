import mongoose from "mongoose";

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
  price: {
    type: String,
    required: true,
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

export default mongoose.model("Dish", dishSchema);
