const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  profilePictureUrl: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
