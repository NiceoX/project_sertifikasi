const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ data: notifs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Notifikasi dibaca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
    res.status(200).json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, readAllNotifications };
