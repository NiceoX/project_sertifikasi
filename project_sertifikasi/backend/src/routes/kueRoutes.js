const express = require("express");
const router = express.Router();
const {
  createKue,
  getAllKue,
  updateKue,
  deleteKue,
  addReview,
  getKueById,
} = require("../controllers/kueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadKue } = require("../middleware/uploadKueMiddleware");

router.get("/", getAllKue);

router.post("/", protect, adminOnly, uploadKue.single("gambar"), createKue);
router.put("/:id", protect, adminOnly, uploadKue.single("gambar"), updateKue);
router.delete("/:id", protect, adminOnly, deleteKue);

router.post("/:id/review", protect, addReview);
router.get("/:id", getKueById);
module.exports = router;
