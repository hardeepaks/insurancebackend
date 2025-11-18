const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

// SECRET
const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";

// SIGNUP
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], (err, row) => {
    if (row) return res.status(400).json({ error: "Email already exists" });

    const hash = bcrypt.hashSync(password, 10);

    db.run(
      "INSERT INTO users (name, email, password) VALUES (?,?,?)",
      [name, email, hash],
      function (err) {
        if (err) return res.status(500).json({ error: "DB error" });

        const token = jwt.sign(
          { id: this.lastID, email, role: "user" },
          JWT_SECRET
        );

        res.json({
          id: this.lastID,
          name,
          email,
          token
        });
      }
    );
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], (err, row) => {
    if (!row) return res.status(400).json({ error: "Invalid credentials" });

    if (!bcrypt.compareSync(password, row.password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role || "user" },
      JWT_SECRET
    );

    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || "user",
      token
    });
  });
});

module.exports = router;
