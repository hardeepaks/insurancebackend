require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');

// ----------------------------------------------------
// CORS (Netlify + Local)
// ----------------------------------------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Log local DB usage
console.log("📦 Using local SQLite DB: ./portal.db");

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vehicle', require('./routes/vehicle'));

app.get('/', (req, res) => {
  res.send("Pride Insurance Backend Running.");
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});