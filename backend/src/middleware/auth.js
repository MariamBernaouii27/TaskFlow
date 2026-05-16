const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Jib token mn header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];

        // Vérifier token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};