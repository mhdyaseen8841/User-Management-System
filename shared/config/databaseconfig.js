const mongoose = require("mongoose");

function connectToDatabase(Name) {
  const uri = process.env.DB_CONNECTION_STRING + Name;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, options);
}

module.exports = {
  connectToDatabase,
};
