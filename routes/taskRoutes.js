const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.post('/taches', async (req, res) => {
    try {
        const nouvelleTache = new Task(req.body);
        await nouvelleTache.save();
        res.status(201).json(nouvelleTache);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/taches', async (req, res) => {
    try {
        const taches = await Task.find().populate('assigneA', 'nom email');
        res.status(200).json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/taches/:id', async (req, res) => {
    try {
        const tacheModifiee = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(tacheModifiee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/taches/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;