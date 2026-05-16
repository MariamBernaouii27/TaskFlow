const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Route protégée (test)
router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Token valide', user: req.user });
});

module.exports = router;