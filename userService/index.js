const express = require('express');
const app = express();
const { connectToDatabase } = require('./config/databaseconfig');
const Joi = require('joi');
const User = require('../shared/models/user'); 
const bcrypt = require('bcrypt');
app.use(express.json());
require('dotenv').config();
const port =  process.env.PORT; 

const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});



const userCache = {}; // In-memory cache for user data


app.post('/users', async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { username, email, password } = req.body;

  // Check if the email already exists in the database
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds, higher is more secure but slower

    // Create and save the new user to the database with the hashed password
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    return res.status(201).json({ message: 'User registered successfully.', user: savedUser });
  } catch (err) {
    console.error('Error saving user to the database:', err);
    next(err);
  }
});
  

  app.get('/users', (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 10; 
  
    User.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec()
      .then((users) => {
        return res.status(200).json({ users });
      })
      .catch((err) => {
        console.error('Error finding users in the database:', err);
        next(err);
      });
  });



  app.get('/users/:email', (req, res) => {
    const userEmail = req.params.email;
  
    User.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
  
        return res.status(200).json({ user });
      })
      .catch((err) => {
        console.error('Error finding user in the database:', err);
        next(err);
      });
  });

  
  // Route for user retrieval

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;

  // Check if the user data is in the cache
  if (userCache[userId] && userCache[userId].expiresAt > Date.now()) {
    console.log('User data retrieved from cache.');
    return res.status(200).json({ user: userCache[userId].data });
  }


  // If the user data is not in the cache, find the user in the database by ID
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds
      userCache[userId] = {
        data: user,
        expiresAt: expirationTime,
      };

      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.error('Error finding user in the database:', err);
      next(err);
    });
});




app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, password } = req.body;

   const { error } = userValidationSchema.validate({ username, email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Find and update the user in the database by ID
  User.findByIdAndUpdate(userId, { username, email, password }, { new: true, lean: true, select: '_id username email' })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    })
    .catch((err) => {
      console.error('Error updating user in the database:', err);
      next(err);
    });
});










app.listen(port, () => {
  console.log(`UserService listening on port ${port}`);
});


connectToDatabase()
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });


  app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  });