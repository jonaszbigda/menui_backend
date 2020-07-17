import mongoose from "mongoose";

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

export default mongoose.model("Restaurant", restaurantSchema);
