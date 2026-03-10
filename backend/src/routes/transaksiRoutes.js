const express = require("express");
const router = express.Router();

const {
  prosesTransaksi,
  getTransaksiById,
  getAllTransaksi,
  updateStatus,
  getAllTransaksiByUserId,
} = require("../controllers/transaksiController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadBukti } = require("../middleware/uploadBuktiMiddleware");

router.post(
  "/proses",
  protect,
  uploadBukti.single("buktiTransfer"),
  prosesTransaksi,
);

router.get("/detail/:id", protect, getTransaksiById);
router.get("/all", protect, adminOnly, getAllTransaksi);
router.put("/status/:id", protect, adminOnly, updateStatus);
router.get("/user/:userId", protect, getAllTransaksiByUserId);

module.exports = router;
