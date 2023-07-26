const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Joi = require("joi");
app.use(express.json());
const Profile = require("../shared/models/profile");
const { connectToDatabase } = require("../shared/config/databaseconfig");
const { authenticateToken } = require("../shared/utils/authMiddleware.js");
const errorHandler = require("../shared/utils/errorHandler");
const logger = require("../shared/utils/logger");
require("dotenv").config();
const axios = require("axios");

const port = process.env.PROFILEPORT;
const userValidationSchema = Joi.object({
 
  fullName: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  bio: Joi.string().min(6).required(),
  profilePictureUrl: Joi.string().min(6).required(),
});

let validateUrl = "http://localhost:" + process.env.USERPORT + "/usersById/";



app.post("/profile",authenticateToken, async (req, res, next) => {
  const {  fullName, bio, profilePictureUrl, city, address } = req.body;
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    logger.error({ error: error.details[0].message });
    return res.status(400).json({ error: error.details[0].message });
  }
  const userId = req.user.userId;
  console.log(req.user);
  if(!userId) {
    logger.error("Invalid userId");
    return res.status(404).json("userId not found");
  }
  try {
    const existingProfile = await Profile.findOne({ userId });

    if (existingProfile) {
      logger.error("already created profile, try update it");

      return res
        .status(400)
        .json({ error: "Already Created Profile, Try Update it" });
    }
    console.log(userId)
    const validationResponse = await axios.get(
      `http://localhost:3000/usersById/${userId}`
    );
console.log(validationResponse)
    if (!validationResponse) {
      logger.error("invalid user id");

      return res.status(400).json({ error: "Invalid user ID." });
    }
console.log("heyyheyy")
    const newProfile = new Profile({
      userId,
      fullName,
      bio,
      profilePictureUrl,
      city,
      address,
    });
    const savedProfile = await newProfile.save();
    return res.status(201).json({
      message: "User profile created successfully.",
      profile: savedProfile,
    });
  } catch (err) {
    logger.error(err.message);
    console.error("Error saving user profile to the database:", err);
    next(err);
  }
});

app.put("/profile/:id", async (req, res, next) => {
  const profileId = req.params.id;
  const { fullName, bio, profilePictureUrl, city, address } = req.body;

  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      { fullName, bio, profilePictureUrl, city, address },
      {
        new: true,
        lean: true,
        select: "_id fullName bio profilePictureUrl city address",
      }
    );

    if (!updatedProfile) {
      logger.error("profile not found");

      return res.status(404).json({ error: "Profile not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    logger.error(err.message);
    next();
  }
});

app.get("/getProfile",authenticateToken, async (req, res, next) => {
  const userId = req.user.userId;
  console.log(req.user);
  if(!userId) {
    logger.error("Invalid userId");
    return res.status(404).json("userId not found");
  }
  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      logger.error("Profile not found");

      return res.status(404).json({ error: "Profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    logger.error("Error finding user profile:", err);
    next();
  }
});

app.get("/profile/location/:city", async (req, res, next) => {
  const city = req.params.city;

  try {
    const profiles = await Profile.aggregate([
      { $match: { city: city } },
      { $limit: 10 },
    ]);

    return res.status(200).json({ profiles });
  } catch (err) {
    logger.error(err.message);
    console.error("Error fetching user profiles by location:", err);
    next();
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Profile Service listening on port ${port}`);
});

connectToDatabase("profile")
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
