
const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    db.all(`SELECT * FROM policies ORDER BY id DESC`, [], (err, rows) => {
      res.json(rows);
    });
  });

  router.post("/create", (req, res) => {
    const p = req.body;
    const policyNumber = "P" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 999);

    db.run(
      `INSERT INTO policies (policy_number, holder_name, vehicle, premium, start_date, end_date, created_by)
       VALUES (?,?,?,?,?,?,?)`,
      [
        policyNumber,
        p.holder_name,
        p.vehicle,
        p.premium,
        p.start_date,
        p.end_date,
        p.userId
      ],
      function (err) {
        if (err) return res.json({ error: "Failed" });
        res.json({ success: true, policy_number: policyNumber });
      }
    );
  });

  router.get("/search", (req, res) => {
    const q = "%" + req.query.q + "%";
    db.all(
      `SELECT * FROM policies WHERE policy_number LIKE ? OR holder_name LIKE ?`,
      [q, q],
      (err, rows) => {
        res.json(rows);
      }
    );
  });

  router.get("/:id", (req, res) => {
    db.get(
      `SELECT * FROM policies WHERE policy_number = ?`,
      [req.params.id],
      (err, row) => {
        res.json(row || {});
      }
    );
  });

  return router;
};
