const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
const app = express();

const {
  authRouter,
  kueRouter,
  categoryRouter,
  transaksiRouter,
  notificationRouter,
  userRouter,
} = require("./src/routes");
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("Mawchi API is running..."));

app.use("/api/auth", authRouter);
app.use("/api/kue", kueRouter);
app.use("/api/category", categoryRouter);
app.use("/api/transaksi", transaksiRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
