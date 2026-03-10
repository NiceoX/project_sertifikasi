const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    namaKategori: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
