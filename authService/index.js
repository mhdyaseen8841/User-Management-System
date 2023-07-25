const express = require('express');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const cache = require('express-redis-cache');
const bcrypt = require('bcrypt');
const { connectToDatabase } = require('./config/databaseconfig');
const User = require('../shared/models/user'); 
const app = express();
app.use(express.json());
require('dotenv').config();
const port =  process.env.AUTHPORT; 


// const cacheClient = cache({
//   host: 'localhost', 
//   port: 6379,
// });
// JWT secret key
const JWT_SECRET = 'jwt@MdriftUserManagement2023';


app.post('/login', async (req, res) => {
  console.log("jtestttt")
  const { email, password } = req.body;
console.log(email)
  try {
    // Find the user by email
    const user = await User.findOne({email: email})
console.log(user);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // User authentication successful. Generate JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

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
    console.error('Error finding user in the database:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
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
    logger.error(err.message, { stack: err.stack });
    return res.status(500).json({ error: 'Internal server error.' });
  });