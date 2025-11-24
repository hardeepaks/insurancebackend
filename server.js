require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');

// ----------------------------------------------------
// CORS (Render + Netlify support)
// ----------------------------------------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// Log DB path
console.log("📦 Using SQLite DB (Render internal): portal.db");

// ----------------------------------------------------
// ROUTE IMPORTS
// ----------------------------------------------------
const authRoutes = require('./routes/auth');
const policyRoutes = require('./routes/policies');
const adminRoutes = require('./routes/admin');
const vehicleRoutes = require('./routes/vehicle');

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicle', vehicleRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send("Pride Insurance Backend Running ✔");
});

// ----------------------------------------------------
// ERROR HANDLING (global)
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({ error: "Server error" });
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Pride Insurance backend running on port ${PORT}`);
});
