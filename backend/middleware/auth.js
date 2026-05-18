const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE — Vérification du token JWT
// Protège toutes les routes authentifiées
// ─────────────────────────────────────────────────────────────

const authMiddleware = (req, res, next) => {

  // 1. Récupérer le header Authorization
  const authHeader = req.headers['authorization'];

  // 2. Vérifier que le header existe et commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  // 3. Extraire le token (enlever "Bearer ")
  const token = authHeader.split(' ')[1];

  // 4. Vérifier et décoder le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attacher les infos du user à la requête
    // → accessible dans toutes les routes via req.user
    req.user = {
      id:    decoded.id,
      email: decoded.email,
      name:  decoded.name
    };

    next(); // passer à la route suivante

  } catch (err) {

    // Token expiré
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
    }

    // Token invalide / modifié
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = authMiddleware;