const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Terhubung!");
  } catch (err) {
    console.error("Gagal konek DB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
