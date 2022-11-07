import mongoose from "mongoose";

const launchesSchema = mongoose.Schema({
  CMID: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  image:{
    type: String,
    required: true,
  },

  creator: {
    type: String,
  },

  mintedUsers: [
    {
      type: String,
    },
  ],

  description:{
    type: String,
  },

  socialLinks:[{
    type: String,
  }],

  priceAmount: {
    type: Number,
  },

  liveDate: {
    type: Date,
    default: new Date(Date.now()),
  },

  timeStamp: {
    type: Date,
    default: new Date(Date.now()),
  },
});

export const Launches = mongoose.model("launches", launchesSchema);
