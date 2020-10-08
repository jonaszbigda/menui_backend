const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  restaurantId: mongoose.Types.ObjectId,
  amount: Number,
  months: Number,
});

module.exorts = mongoose.model("Payment", paymentSchema);
