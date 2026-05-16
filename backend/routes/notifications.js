const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const filter = { recipient: req.query.userId };
    if (req.query.unreadOnly === "true") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.query.userId,
      read: false,
    });

    res.json({ data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: notification.recipient,
      read: false,
    });

    res.json({ notification, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.query.userId, read: false },
      { read: true }
    );
    res.json({ unreadCount: 0 });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;