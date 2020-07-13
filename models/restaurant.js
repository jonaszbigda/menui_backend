const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  workingHours: {
    type: String,
    required: true,
  },
  hidden: Boolean,
  dishes: [mongoose.Types.ObjectId],
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
