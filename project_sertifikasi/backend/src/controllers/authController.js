const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken, generateRefreshToken } = require("../utils/jwt");

const register = async (req, res) => {
  try {
    const { username, email, password, noHp, alamat } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Username atau Email sudah terdaftar",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      alamat,
      noHp,
      role: "pembeli",
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      //   data: { userId: newUser._id },
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      data: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: "Email atau Password salah",
        data: null,
      });
    }

    const accessToken = generateToken(user._id, user.role, user.username);
    const refreshToken = generateRefreshToken(user._id);

    console.log("access token:\n", accessToken);
    console.log("refresh token:\n", refreshToken);

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.cookie("token", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login berhasil",
      //   data: { id: user._id, username: user.username, role: user.role },
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      data: error.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Sesi habis, silakan login",
        data: null,
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        message: "Sesi tidak valid",
        data: null,
      });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Sesi kadaluarsa",
          data: null,
        });
      }

      const newAccessToken = generateToken(user._id, user.role);
      console.log("access token baru setelah refresh: ", newAccessToken);

      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Token diperbarui",
        data: null,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      data: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } },
      );
    }

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logout berhasil",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
      data: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        data: null,
      });
    }

    res.status(200).json({
      message: "Data user berhasil diambil",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data user",
      data: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
};
