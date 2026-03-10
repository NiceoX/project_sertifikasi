const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  readAllNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, readAllNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
