const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", err);
  logger.error(err.message, { stack: err.stack });
  return res.status(500).json({ error: err.message });
};

module.exports = errorHandler;
