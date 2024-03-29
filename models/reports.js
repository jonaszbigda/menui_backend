const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  date: Date,
  users: Number,
  restaurants: Number,
  subscriptionsActive: Number,
  subscriptionsCancelled: Number,
  invoicesSent: Number
});

module.exports = mongoose.model("Report", reportSchema);