const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

const jwtSecret = 'your_jwt_secret_here';

// Your authentication routes and logic here

const port = 3001;
app.listen(port, () => {
  console.log(`Authentication Service listening on port ${port}`);
});
