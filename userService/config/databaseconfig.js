const mongoose = require('mongoose');

// Function to establish a MongoDB connection
function connectToDatabase() {
  const uri =  process.env.DB_CONNECTION_STRING+'users';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, options);
}

module.exports = {
  connectToDatabase,
};
