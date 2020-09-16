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
  billing: {
    NIP: {
      type: String,
      required: true,
    },
    adress: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
  },
  restaurants: [mongoose.Types.ObjectId],
  trialUsed: Boolean,
});

export default mongoose.model("User", userSchema);
