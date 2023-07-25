// shared/authMiddleware.js
const jwt = require('jsonwebtoken');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET; // Replace with your JWT secret key

// Middleware to verify and decode JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
