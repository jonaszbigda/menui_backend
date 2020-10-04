import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  restaurantId: mongoose.Types.ObjectId,
  amount: Number,
  months: Number,
});

export default mongoose.model("Payment", paymentSchema);
