const mongoose = require("mongoose");

const logHistorySchema = new mongoose.Schema(
  {
    tipe: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },
    aksi: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LogHistory", logHistorySchema);
