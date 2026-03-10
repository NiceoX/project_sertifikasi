const User = require("../models/User");
const Transaksi = require("../models/Transaksi");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "pembeli" })
      .select("nama email createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Data pelanggan berhasil diambil",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const semuaTransaksi = await Transaksi.find({ pembeli: id });

    const totalTransaksi = semuaTransaksi.length;
    const transaksiTerbesar =
      semuaTransaksi.length > 0
        ? Math.max(...semuaTransaksi.map((t) => t.totalHarga))
        : 0;

    res.status(200).json({
      message: "Detail user berhasil diambil",
      data: {
        profile: user,
        statistik: {
          totalTransaksi,
          transaksiTerbesar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, oldPassword, newPassword, alamat, noHp } =
      req.body;

    let user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (alamat) user.alamat = alamat;
    if (noHp) user.noHp = noHp;

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          message: "Password lama wajib diisi untuk mengganti password",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Password lama tidak sesuai" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      message: "Identitas user berhasil diperbarui",
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update profil", data: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateProfile };
