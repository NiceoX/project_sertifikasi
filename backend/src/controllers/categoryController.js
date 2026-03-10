const Category = require("../models/Category");
const LogHistory = require("../models/LogHistory");

const createCategory = async (req, res) => {
  try {
    const { namaKategori } = req.body;

    const existingCategory = await Category.findOne({
      namaKategori: namaKategori,
      deletedAt: null,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Kategori sudah terdaftar",
        data: null,
      });
    }

    const category = await Category.create({ namaKategori });

    await LogHistory.create({
      tipe: "CREATE",
      aksi: `Menambah kategori baru: ${namaKategori}`,
      targetId: category._id,
    });

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      //   data: category,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat kategori",
      data: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { deletedAt: null };

    if (search) filter.namaKategori = { $regex: search, $options: "i" };

    const categories = await Category.find(filter).sort({ namaKategori: 1 });

    res
      .status(200)
      .json({ message: "Data kategori berhasil diambil", data: categories });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKategori } = req.body;

    const existingCategory = await Category.findOne({
      namaKategori: namaKategori,
      deletedAt: null,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Kategori sudah terdaftar",
        data: null,
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { namaKategori },
      { new: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ message: "Kategori tidak ditemukan", data: null });
    }

    await LogHistory.create({
      tipe: "UPDATE",
      aksi: `Mengubah nama kategori menjadi: ${namaKategori}`,
      targetId: category._id,
    });

    res.status(200).json({
      message: "Kategori berhasil diupdate",
      //   data: category,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
      data: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ message: "Kategori tidak ditemukan", data: null });
    }

    await LogHistory.create({
      tipe: "DELETE",
      aksi: `Menghapus kategori: ${category.namaKategori}`,
      targetId: id,
    });

    res.status(200).json({ message: "Kategori berhasil dihapus", data: null });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
