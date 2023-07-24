const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true }, // Add index for the email field
    password: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now }
  });

const User = mongoose.model('User', userSchema);

module.exports = User;