const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
// GET /api/dashboard
router.get('/', auth, async (req, res) => {
try {
const userId = req.user._id;
const now = new Date();
// 1. Projets actifs
const [{ activeProjects } = { activeProjects: 0 }] =
await Project.aggregate([
{ $match: { owner: userId, status: 'active' } },
{ $count: 'activeProjects' },
]);
// 2. Metriques des taches (un seul $group)
const [taskStats = {}] = await Task.aggregate([
{ $match: { assignee: userId } },
{
$group: {
_id: null,
assigned: { $sum: 1 },
completed: { $sum: { $cond: [{ $eq: ['$status','done'] }, 1, 0] } },
overdue: {
$sum: {
$cond: [{
$and: [
{ $lt: ['$deadline', now] },
{ $ne: ['$status', 'done'] },
]
}, 1, 0]
}
}
}
}
]);
// 3. Taches en cours : priorite desc + deadline asc
const activeTasks = await Task.aggregate([
{ $match: { assignee: userId, status: { $ne: 'done' } } },
{ $addFields: {
priorityRank: { $switch: {
branches: [
{ case: { $eq: ['$priority','high'] }, then: 3 },
{ case: { $eq: ['$priority','medium'] }, then: 2 },
{ case: { $eq: ['$priority','low'] }, then: 1 },
],
default: 0
}}
}},
{ $sort: { priorityRank: -1, deadline: 1 } },
{ $project: { title:1, status:1, priority:1, deadline:1,
project:1, priorityRank: 0 } },
]);
res.json({
metrics: {
activeProjects,
assigned: taskStats.assigned ?? 0,
completed: taskStats.completed ?? 0,
overdue: taskStats.overdue ?? 0,
},
activeTasks,
});
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Erreur serveur' });
}
});
module.exports = router;