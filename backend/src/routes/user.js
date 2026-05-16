const express = require('express');
const router = express.Router();
const User = require('../models/auth');

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = new User({ fullName, email, password });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  res.send('Login logic with JWT goes here');
});

module.exports = router;