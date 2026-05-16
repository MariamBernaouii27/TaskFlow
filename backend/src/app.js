const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend/js')));

const authRoutes = require('./routes/user');
app.use('/api/auth', authRoutes);

module.exports = app;