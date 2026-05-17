const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');

app.use("/api/projects", require("./backend/routes/activities"));
app.use("/api/notifications", require("./backend/routes/notifications"));