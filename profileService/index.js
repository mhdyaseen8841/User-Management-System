const express = require('express');
const app = express();
const profiles = {}; // In-memory data store for user profiles

// Your profile service routes and logic here

const port = 3002;
app.listen(port, () => {
  console.log(`Profile Service listening on port ${port}`);
});
