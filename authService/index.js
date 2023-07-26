const express = require("express");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const cache = require("express-redis-cache");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { connectToDatabase } = require("../shared/config/databaseconfig");
const User = require("../shared/models/user");
const app = express();
app.use(express.json());

require("dotenv").config();
const port = process.env.AUTHPORT;
const errorHandler = require("../shared/utils/errorHandler");
const logger = require("../shared/utils/logger");

// const cacheClient = cache({
//   host: 'localhost',
//   port: 6379,
// });
const JWT_SECRET = process.env.JWT_SECRET;

const userValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

app.post("/login", async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      logger.error("Couldn't find user", { email: email });
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ email: user.email, userId:user._id }, JWT_SECRET, {
      expiresIn: "6h",
    });

    // cacheClient.add(token, 'valid', { expire: 3600 }, (err) => {
    //   if (err) {
    //     console.error('Error caching token in Redis:', err);
    //     return res.status(500).json({ error: 'Internal server error.' });
    //   }

    //   // Send the token as the response
    //   res.json({ token });
    // });
    res.json({ token });
  } catch (err) {
    console.error("Error finding user in the database:", err);
    next(err);
  }
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
