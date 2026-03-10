const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  komentar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const kueSchema = new mongoose.Schema(
  {
    namaKue: { type: String, required: true },
    kategori: { type: String, required: true },
    harga: { type: Number, required: true },
    stok: { type: Number, required: true, default: 0 },
    gambar: { type: String }, // Path file di folder uploads/kue
    deskripsi: { type: String },
    reviews: [reviewSchema],
    avgRating: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Kue", kueSchema);
