const User = require('../models/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check ila email mawjod
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Créer user (password ghadi yit7ash automatiquement f model)
        const user = new User({ fullName, email, password });
        await user.save();

        res.status(201).json({ message: 'Compte créé avec succès' });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check ila user mawjod
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};