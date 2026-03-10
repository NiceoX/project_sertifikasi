const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refresh,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
