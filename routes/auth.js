
const bcrypt = require("bcrypt");
const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email,password_hash,name) VALUES (?,?,?)`,
      [email, hash, name],
      function (err) {
        if (err) return res.json({ error: "Email exists" });
        res.json({ success: true, userId: this.lastID });
      }
    );
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (!user) return res.json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.json({ error: "Invalid credentials" });

        res.json({
          success: true,
          userId: user.id,
          name: user.name
        });
      }
    );
  });

  return router;
};
