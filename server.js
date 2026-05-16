const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connecte');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Serveur demarre sur le port 3000');
    });
  })
  .catch((err) => console.error(err));