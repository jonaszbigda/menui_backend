const mongoose = require("mongoose");

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
    maxlength: 24,
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 24,
  },
  billing: {
    NIP: {
      type: String,
      required: true,
      maxlength: 20,
    },
    adress: {
      type: String,
      required: true,
      maxlength: 128,
    },
    companyName: {
      type: String,
      required: true,
      maxlength: 64,
    },
  },
  restaurants: [mongoose.Types.ObjectId],
  trialUsed: Boolean,
});

module.exports = mongoose.model("User", userSchema);
