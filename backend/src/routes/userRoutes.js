const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateProfile,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/all", protect, adminOnly, getAllUsers);

router.get("/detail/:id", protect, adminOnly, getUserById);

router.put("/update/:id", protect, updateProfile);

module.exports = router;
