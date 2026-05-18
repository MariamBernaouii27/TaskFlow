const Activity = require("../models/Activity");

const logActivity = async (type, projectId, userId, meta = {}) => {
  try {
    await Activity.create({ 
      type, 
      project: projectId, 
      user: userId, 
      meta 
    });
  } catch (err) {
    console.error("[logActivity] Erreur :", err.message);
  }
};

module.exports = logActivity;