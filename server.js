const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const policyRoutes = require('./routes/policies');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.json({ status: "Pride Insurance Backend Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
