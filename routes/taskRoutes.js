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
module.exports = router;