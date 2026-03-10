const fs = require("fs");
const Transaksi = require("../models/Transaksi");
const Kue = require("../models/Kue");
const LogHistory = require("../models/LogHistory");
const Notification = require("../models/Notification");
const User = require("../models/User");

const prosesTransaksi = async (req, res) => {
  try {
    const { items, catatan } = req.body;
    const parsedItems = JSON.parse(items);
    const userId = req.user.id;
    const buktiTransfer = req.file ? req.file.path : null;

    console.log("user yang login\n", req.user);

    if (!buktiTransfer) {
      return res
        .status(400)
        .json({ message: "Silakan unggah bukti pembayaran terlebih dahulu" });
    }

    let totalHarga = 0;
    const itemFinal = [];

    for (const item of parsedItems) {
      const kue = await Kue.findById(item.kue);

      if (!kue || kue.deletedAt !== null) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(404)
          .json({ message: `Produk ${item.kue} tidak ditemukan` });
      }

      if (kue.stok < item.jumlah) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: `Stok ${kue.namaKue} tidak mencukupi!` });
      }

      totalHarga += kue.harga * item.jumlah;
      itemFinal.push({
        kue: kue._id,
        jumlah: item.jumlah,
        hargaSaatBeli: kue.harga,
      });

      kue.stok -= item.jumlah;
      await kue.save();
    }

    const transaksi = await Transaksi.create({
      pembeli: userId,
      items: itemFinal,
      totalHarga,
      catatan,
      buktiTransfer,
      status: "Menunggu Konfirmasi",
    });

    // await LogHistory.create({
    //   tipe: "CREATE",
    //   aksi: `Pesanan baru dibuat: ${transaksi._id} senilai Rp${totalHarga}`,
    //   targetId: transaksi._id,
    // });

    await Notification.create({
      recipient: userId,
      title: "Pesanan Diterima",
      message: `Terima kasih! Silahkan cek notifikasi untuk status pemesanan anda, konfirmasi lebih lanjut hubungi penjual via Whatsapp`,
      targetId: transaksi._id,
    });

    const admins = await User.find({ role: "admin" });
    const adminNotifs = admins.map((admin) => ({
      recipient: admin._id,
      title: "Ada Pesanan Baru!",
      message: `User ${req.user.username} baru saja melakukan transaksi.`,
      targetId: transaksi._id,
    }));
    await Notification.insertMany(adminNotifs);

    res.status(201).json({
      message:
        "Transaksi berhasil, silahkan cek notifikasi anda, atau konfirmasi lebih lanjut hubungi penjual via Whatsapp",
      data: null,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res
      .status(500)
      .json({ message: "Gagal memproses transaksi", data: error.message });
  }
};

const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaksi = await Transaksi.findById(id)
      .populate("pembeli", "nama email")
      .populate("items.kue", "namaKue gambar");

    if (!transaksi)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    res.status(200).json({
      message: "Detail transaksi berhasil diambil",
      data: transaksi,
      //   data: null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaksi = await Transaksi.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    await LogHistory.create({
      tipe: "UPDATE",
      aksi: `Mengubah status transaksi id: ${id} menjadi ${status}`,
      targetId: id,
    });

    await Notification.create({
      recipient: transaksi.pembeli,
      title: "Update Status Pesanan",
      message: `Status pesanan dengan id: ${id} Anda kini: ${status}`,
      targetId: id,
    });

    res.status(200).json({
      message: "Status diperbarui",
      // data: transaksi,
      data: null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const getAllTransaksi = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) filter.status = status;

    const data = await Transaksi.find(filter)
      .populate("pembeli", "nama email")
      .populate("items.kue", "namaKue")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Data transaksi berhasil diambil", data });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

const getAllTransaksiByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let filter = { pembeli: userId };
    if (status) filter.status = status;

    const transaksi = await Transaksi.find(filter)
      .populate("items.kue", "namaKue gambar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message:
        transaksi.length > 0
          ? "Riwayat berhasil diambil"
          : "Tidak ada transaksi",
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", data: error.message });
  }
};

module.exports = {
  prosesTransaksi,
  getTransaksiById,
  getAllTransaksi,
  updateStatus,
  getAllTransaksiByUserId,
};
