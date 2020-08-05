import mongoose from "mongoose";

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
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  restaurantId: mongoose.Types.ObjectId,
  subscriptionActive: {
    type: Boolean,
    required: true,
  },
  subscriptionDue: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
