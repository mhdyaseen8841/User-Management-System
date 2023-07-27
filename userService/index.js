const express = require("express");
const app = express();
const { connectToDatabase } = require("../shared/config/databaseconfig");
const Joi = require("joi");
const User = require("../shared/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../shared/utils/errorHandler");
const logger = require("../shared/utils/logger");
app.use(express.json());
require("dotenv").config();
const port = process.env.USERPORT;
const JWT_SECRET = process.env.JWT_SECRET;
const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userCache = {};

app.post("/user", async (req, res, next) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    logger.error({ error: error.details[0].message });
    return res.status(400).json({ error: error.details[0].message });
  }
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();
   
    const token = jwt.sign({ email: savedUser.email, userId:savedUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      token:token
    };


    return res
      .status(201)
      .json({ message: "User registered successfully.", user: userResponse });
  } catch (err) {
    console.error("Error saving user to the database:", err);
    next(err);
  }
});

app.get("/users", (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  User.find({},{ password: 0 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .exec()
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      console.error("Error finding users in the database:", err);
      next(err);
    });
});

app.get("/users/:email", (req, res, next) => {
  const userEmail = req.params.email;

  User.findOne({ email: userEmail })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.error("Error finding user in the database:", err);
      next(err);
    });
});

app.get("/usersById/:id", (req, res, next) => {
  const userId = req.params.id;
console.log("heyyheyyy")
  // Check if the user data is in the cache
  if (userCache[userId] && userCache[userId].expiresAt > Date.now()) {
    console.log("User data retrieved from cache.");
    return res.status(200).json({ user: userCache[userId].data });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        logger.error("User not found");
        return res.status(404).json({ error: "User not found." });
      }
      const expirationTime = Date.now() + 3600000;
      userCache[userId] = {
        data: user,
        expiresAt: expirationTime,
      };

      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.error("Error finding user in the database:", err);
      next(err);
    });
});

app.put("/users/:id", (req, res, next) => {
  const userId = req.params.id;
  const { username, email, password } = req.body;

  const { error } = userValidationSchema.validate({
    username,
    email,
    password,
  });
  if (error) {
    logger.error("validaton error: " + error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  User.findByIdAndUpdate(
    userId,
    { username, email, password },
    { new: true, lean: true, select: "_id username email" }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        logger.error("User not found");
        return res.status(404).json({ error: "User not found." });
      }

      return res
        .status(200)
        .json({ message: "User updated successfully.", user: updatedUser });
    })
    .catch((err) => {
      console.error("Error updating user in the database:", err);
      next(err);
    });
});

app.listen(port, () => {
  console.log(`UserService listening on port ${port}`);
});

connectToDatabase("users")
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

app.use(errorHandler);
