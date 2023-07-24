const express = require('express');
const app = express();
const { connectToDatabase } = require('../shared/config/databaseconfig');
const users = []; 
const User = require('../shared/models/user'); 
app.use(express.json());


const port = 3000;
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
