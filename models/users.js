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
    maxlength: 64,
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 64,
  },
  billing: {
    NIP: {
      type: String,
      required: true,
      maxlength: 64,
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
});

export default mongoose.model("User", userSchema);
