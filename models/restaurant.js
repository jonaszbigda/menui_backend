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
  adress: {
    type: String,
    maxlength: 128,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  imgUrl: {
    type: String,
  },
  workingHours: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  tags: {
    cardPayments: Boolean,
    petFriendly: Boolean,
    glutenFree: Boolean,
    vegan: Boolean,
    vegetarian: Boolean,
    alcohol: Boolean,
    delivery: Boolean,
  },
  links: {
    facebook: String,
    twitter: String,
    instagram: String,
    www: String,
  },
  phone: Number,
  hidden: Boolean,
  subscriptionActive: Boolean,
  subscriptionStarted: Date,
  subscriptionDue: Date,
  dishes: [mongoose.Types.ObjectId],
});

export default mongoose.model("Restaurant", restaurantSchema);
