const mongoose = require('mongoose');

// Function to establish a MongoDB connection
function connectToDatabase() {
  const uri = 'mongodb+srv://yyaseen:oOp6HbcomsWlPW0n@cluster0.r2mewtj.mongodb.net/mdrift';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, options);
}

module.exports = {
  connectToDatabase,
};
