const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/projects',  require('./routes/members'));
// app.use('/api/auth',   require('./routes/auth'));    // Fonction 1
// app.use('/api/tasks',  require('./routes/tasks'));   // Fonction 3

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message);
    process.exit(1);
  });