const express = require('express');
const router  = express.Router({ mergeParams: true }); // pour accéder à req.params.id du projet
const User    = require('../models/User');
const authMiddleware = require('../middleware/auth');
const isOwner        = require('../middleware/isOwner');

// ─────────────────────────────────────────────────────────────
// GET /api/projects/:id/members
// Voir la liste des membres d'un projet
// Accessible par le créateur ET les membres
// ─────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const Project = require('../models/Project');

    const project = await Project.findById(req.params.id)
      .populate('members', 'name email') // retourne nom + email seulement (pas le mot de passe)
      .populate('owner',   'name email');

    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Vérifier que l'utilisateur connecté est membre ou créateur
    const isMember = project.members.some(m => m._id.toString() === req.user.id);
    const isOwnerUser = project.owner._id.toString() === req.user.id;

    if (!isMember && !isOwnerUser) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    res.json({
      owner:   project.owner,
      members: project.members
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// POST /api/projects/:id/members
// Inviter un membre par email (créateur seulement)
// ─────────────────────────────────────────────────────────────
router.post('/', authMiddleware, isOwner, async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validation
    if (!email) {
      return res.status(400).json({ message: 'L\'email est obligatoire.' });
    }

    // 2. Chercher l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });
    }

    // 3. Vérifier que ce n'est pas le créateur lui-même
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Vous êtes déjà le créateur du projet.' });
    }

    // 4. Vérifier qu'il n'est pas déjà membre
    const dejaPresent = req.project.members.some(
      memberId => memberId.toString() === user._id.toString()
    );
    if (dejaPresent) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà membre du projet.' });
    }

    // 5. Ajouter au tableau members
    req.project.members.push(user._id);
    await req.project.save();

    res.status(201).json({
      message: `${user.name} a été ajouté au projet avec succès.`,
      member:  { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// DELETE /api/projects/:id/members/:userId
// Retirer un membre (créateur seulement)
// ─────────────────────────────────────────────────────────────
router.delete('/:userId', authMiddleware, isOwner, async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Vérifier que le membre existe dans le projet
    const existeDansMembre = req.project.members.some(
      memberId => memberId.toString() === userId
    );
    if (!existeDansMembre) {
      return res.status(404).json({ message: 'Ce membre n\'est pas dans le projet.' });
    }

    // 2. Retirer le membre du tableau
    req.project.members = req.project.members.filter(
      memberId => memberId.toString() !== userId
    );
    await req.project.save();

    res.json({ message: 'Membre retiré avec succès.' });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


module.exports = router;