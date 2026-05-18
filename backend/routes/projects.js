const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// ─── Toutes les routes sont protégées par le middleware JWT ───
router.use(authMiddleware);


// ─────────────────────────────────────────────────────────────
// GET /api/projects
// Récupérer tous les projets de l'utilisateur connecté (paginé)
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;   // page courante (défaut: 1)
    const limit = parseInt(req.query.limit) || 10;  // projets par page (défaut: 10)
    const skip  = (page - 1) * limit;

    // On récupère seulement les projets créés par l'utilisateur connecté
    const filter = { owner: req.user.id };

    const [projects, total] = await Promise.all([
      Project.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Project.countDocuments(filter)
    ]);

    res.json({
      data:       projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// POST /api/projects
// Créer un nouveau projet
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    // Validation basique
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Le titre est obligatoire.' });
    }

    const project = await Project.create({
      title:       title.trim(),
      description: description?.trim(),
      deadline:    deadline || null,
      owner:       req.user.id   // ID de l'utilisateur connecté (depuis le token JWT)
      // status: 'actif' par défaut (défini dans le schéma)
    });

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// PUT /api/projects/:id
// Modifier un projet (seulement le créateur peut modifier)
// ─────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    // Validation du statut si fourni
    const validStatuses = ['actif', 'en pause', 'archivé'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    // On cherche le projet qui appartient à cet utilisateur
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id }, // double sécurité : _id + owner
      {
        ...(title       && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(deadline    !== undefined && { deadline: deadline || null }),
        ...(status      && { status })
      },
      { new: true, runValidators: true } // retourne le document mis à jour
    );

    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable ou accès refusé.' });
    }

    res.json(project);

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────
// DELETE /api/projects/:id
// Supprimer un projet + suppression en cascade de ses tâches
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // On cherche le projet qui appartient à cet utilisateur
    const project = await Project.findOne({
      _id:   req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable ou accès refusé.' });
    }

    // .deleteOne() déclenche le middleware pre('deleteOne') dans le schéma
    // → supprime automatiquement toutes les tâches liées à ce projet
    await project.deleteOne();

    res.json({ message: 'Projet et ses tâches supprimés avec succès.' });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


module.exports = router;