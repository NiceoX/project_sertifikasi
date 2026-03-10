const jwt = require("jsonwebtoken");

const generateToken = (id, role, username) => {
  return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

module.exports = { generateToken, generateRefreshToken };
