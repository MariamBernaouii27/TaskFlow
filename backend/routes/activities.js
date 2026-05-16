const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

/**
 * GET /api/projects/:id/activities
 * ترجع activities ديال project مرتبة من الأحدث للأقدم
 */
router.get("/:id/activities", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ project: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email"),
      Activity.countDocuments({ project: req.params.id }),
    ]);

    res.json({
      data: activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;