const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  kue: { type: mongoose.Schema.Types.ObjectId, ref: "Kue", required: true },
  jumlah: { type: Number, required: true },
  hargaSaatBeli: { type: Number, required: true },
});

const transaksiSchema = new mongoose.Schema(
  {
    pembeli: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [itemSchema],
    totalHarga: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Menunggu Konfirmasi",
        "Dalam Proses Pengiriman",
        "Selesai",
        "Dibatalkan",
      ],
      default: "Menunggu Konfirmasi",
    },
    buktiTransfer: { type: String },
    catatan: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaksi", transaksiSchema);
