const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/bukti_tf/");
  },
  filename: (req, file, cb) => {
    cb(null, `bukti-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (jpg/png) yang diizinkan!"));
  }
};

const uploadBukti = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limit 3MB
  fileFilter: fileFilter,
});

module.exports = { uploadBukti };
