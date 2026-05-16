const User = require('../models/auth'); // Import du modèle qu'on vient de créer
const jwt = require('jsonwebtoken');

// Fonction pour générer le token JWT (valable 24h par exemple)
const generateToken = (userId) => {
    // Le JWT_SECRET doit obligatoirement être dans ton fichier .env !
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

// 1. INSCRIPTION (Register)
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Créer l'utilisateur (le mot de passe sera haché automatiquement grâce au pre('save') !)
        const user = await User.create({ fullName, email, password });

        // Générer le token JWT pour le connecter directement
        const token = generateToken(user._id);

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de l'inscription", error: error.message });
    }
};

// 2. CONNEXION (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Chercher l'utilisateur par son email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Vérifier si le mot de passe est correct (via la méthode comparePassword du modèle)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Générer le token JWT
        const token = generateToken(user._id);

        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la connexion", error: error.message });
    }
};