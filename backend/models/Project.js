const mongoose = require('mongoose');

// SCHÉMA — Project

const projectSchema = new mongoose.Schema(
  {
    // Titre du projet (obligatoire)
    title: {
      type:     String,
      required: [true, 'Le titre est obligatoire.'],
      trim:     true
    },

    // Description (optionnelle)
    description: {
      type:    String,
      trim:    true,
      default: ''
    },

    // Date limite (optionnelle)
    deadline: {
      type:    Date,
      default: null
    },

    // Statut du projet
    status: {
      type:    String,
      enum:    ['actif', 'en pause', 'archivé'],
      default: 'actif'
    },

    // Référence vers le créateur du projet (User)
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Le propriétaire est obligatoire.']
    },

    // Membres du projet (Fonctionnalité 8)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User'
      }
    ]
  },
  {
    timestamps: true // createdAt + updatedAt automatiques
  }
);


// MIDDLEWARE — Suppression en cascade des tâches
// Se déclenche automatiquement avant chaque .deleteOne()
projectSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Task').deleteMany({ project: this._id });
});


module.exports = mongoose.model('Project', projectSchema);