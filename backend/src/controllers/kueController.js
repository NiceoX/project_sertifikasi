const Kue = require("../models/Kue");
const LogHistory = require("../models/LogHistory");
const fs = require("fs");

const createKue = async (req, res) => {
  try {
    const { namaKue, kategori, harga, stok, deskripsi } = req.body;
    const gambar = req.file ? req.file.path : null;

    const existingKue = await Kue.findOne({
      namaKue: namaKue,
      deletedAt: null,
    });

    if (existingKue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Produk sudah terdaftar",
        data: null,
      });
    }

    const newKue = await Kue.create({
      namaKue,
      kategori,
      harga,
      stok,
      deskripsi,
      gambar,
    });

    await LogHistory.create({
      tipe: "CREATE",
      aksi: `Menambah kue baru: ${namaKue}`,
      targetId: newKue.id,
    });

    res.status(201).json({
      message: "Kue berhasil ditambahkan",
      //   data: newKue,
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menambah kue", data: error.message });
  }
};

const getAllKue = async (req, res) => {
  try {
    const { kategori, search } = req.query;
    let filter = { deletedAt: null };

    if (kategori) filter.kategori = kategori;
    if (search) filter.namaKue = { $regex: search, $options: "i" };

    const kues = await Kue.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ message: "Data kue berhasil diambil", data: kues });
  } catch (error) {
    res.status(500).json({ message: "Server error", data: error.message });
  }
};
const updateKue = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKue, kategori, harga, stok, deskripsi } = req.body;

    const existingKue = await Kue.findOne({
      namaKue: namaKue,
      deletedAt: null,
    });

    if (existingKue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Produk sudah terdaftar",
        data: null,
      });
    }

    const currentKue = await Kue.findById(id);
    if (!currentKue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ message: "Kue tidak ditemukan", data: null });
    }

    let pathGambar = currentKue.gambar;

    if (req.file) {
      pathGambar = req.file.path;
      if (currentKue.gambar && fs.existsSync(currentKue.gambar)) {
        fs.unlinkSync(currentKue.gambar);
      }
    }

    const updates = {
      namaKue,
      kategori,
      harga,
      stok,
      deskripsi,
      gambar: pathGambar,
    };

    const updatedKue = await Kue.findByIdAndUpdate(id, updates, { new: true });

    await LogHistory.create({
      tipe: "UPDATE",
      aksi: `Memperbarui data kue: ${updatedKue.namaKue}`,
      targetId: updatedKue.id,
    });

    res.status(200).json({ message: "Kue berhasil diperbarui", data: null });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Gagal update kue", data: error.message });
  }
};

const deleteKue = async (req, res) => {
  try {
    const { id } = req.params;
    const kue = await Kue.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!kue) {
      return res.status(404).json({
        message: "Kue tidak ditemukan atau sudah dihapus",
        data: null,
      });
    }
    await LogHistory.create({
      tipe: "DELETE",
      aksi: `Menghapus kue: ${kue.namaKue}`,
      targetId: id,
    });

    res.status(200).json({ message: "Kue berhasil dihapus", data: null });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus kue", data: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, komentar } = req.body;
    const userId = req.user.id;

    const kue = await Kue.findById(id);

    if (!kue) {
      return res
        .status(404)
        .json({ message: "Kue tidak ditemukan", data: null });
    }

    const newReview = {
      user: userId,
      rating: Number(rating),
      komentar,
    };

    kue.reviews.push(newReview);

    const totalRating = kue.reviews.reduce((acc, item) => item.rating + acc, 0);
    kue.avgRating = totalRating / kue.reviews.length;

    await kue.save();

    res.status(201).json({
      message: "Review berhasil ditambahkan",
      //   data: kue,
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memberikan review", data: error.message });
  }
};

const getKueById = async (req, res) => {
  try {
    const { id } = req.params;

    const kue = await Kue.findOne({ _id: id, deletedAt: null }).populate(
      "reviews.user",
      "nama",
    );

    if (!kue) {
      return res.status(404).json({
        message: "Kue tidak ditemukan atau sudah tidak tersedia",
        data: null,
      });
    }

    res.status(200).json({
      message: "Detail kue berhasil diambil",
      data: kue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail kue",
      data: error.message,
    });
  }
};

module.exports = {
  createKue,
  getAllKue,
  getKueById,
  updateKue,
  deleteKue,
  addReview,
};
