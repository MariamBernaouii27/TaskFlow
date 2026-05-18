const Project = require('../models/Project');


// MIDDLEWARE — Vérification que l'utilisateur est le créateur
// Utilisé dans toutes les routes de gestion des membres


const isOwner = async (req, res, next) => {
  try {
    // 1. Chercher le projet par son ID (depuis les params de la route)
    const project = await Project.findById(req.params.id);

    // 2. Vérifier que le projet existe
    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // 3. Comparer le créateur du projet avec l'utilisateur connecté
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé. Réservé au créateur du projet.' });
    }

    // 4. Attacher le projet à la requête pour l'utiliser dans les routes
    // → évite de refaire une requête MongoDB dans chaque route
    req.project = project;

    next(); // tout est OK → passer à la route

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = isOwner;