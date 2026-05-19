const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. إنشاء مهمة جديدة
router.post('/taches', async (req, res) => {
    try {
        const nouvelleTache = new Task(req.body);
        await nouvelleTache.save();
        res.status(201).json(nouvelleTache);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 2. إظهار جميع المهام
router.get('/taches', async (req, res) => {
    try {
        const taches = await Task.find().populate('assigneA', 'nom email');
        res.status(200).json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. تعديل مهمة أو تعيينها لمستخدم
router.put('/taches/:id', async (req, res) => {
    try {
        const tacheModifiee = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(tacheModifiee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. حذف مهمة
router.delete('/taches/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;