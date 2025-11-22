require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');

// ----------------------------------------------------
// CORS (Allow Netlify Frontend)
// ----------------------------------------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ----------------------------------------------------
// LOG DATABASE LOCATION (important for Render)
// ----------------------------------------------------
console.log("📦 Using SQLite DB at /var/data/portal.db");

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vehicle', require('./routes/vehicle'));

// ----------------------------------------------------
// ROOT ENDPOINT
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.send('Backend running — Pride Insurance API');
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Pride Insurance backend running on port ${PORT}`);
});
