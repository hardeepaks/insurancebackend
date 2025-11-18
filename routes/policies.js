const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../db");

// GET MINE
router.get("/mine", auth, (req, res) => {
  db.all(
    "SELECT * FROM policies WHERE user_id=? ORDER BY id DESC",
    [req.user.id],
    (err, rows) => res.json(rows || [])
  );
});

// GET ONE
router.get("/:policy_number", auth, (req, res) => {
  db.get(
    "SELECT * FROM policies WHERE policy_number=? AND user_id=?",
    [req.params.policy_number, req.user.id],
    (err, row) => {
      if (!row) return res.status(404).json({ error: "Not found" });
      res.json(row);
    }
  );
});

// SUBMIT NEW POLICY
router.post("/submit", auth, (req, res) => {
  const {
    registration,
    vehicle_make,
    vehicle_model,
    vehicle_engine,
    vehicle_year,

    start_date,
    end_date,
    duration_days,
    cover_level,
    estimated_premium,
    card_ending,

    first_name,
    last_name,
    dob,
    phone,
    occupation,
    licence_number,
    address,
    postcode
  } = req.body;

  const policy_number = "PI-" + Date.now();
  const created_at = new Date().toISOString();
  const vehicle_full = `${vehicle_make} ${vehicle_model} ${vehicle_engine}cc (${vehicle_year})`;

  const sql = `
    INSERT INTO policies (
      user_id, policy_number,
      vehicle_make, vehicle_model, vehicle_engine, vehicle_year,
      vehicle, registration,
      start_date, end_date, duration_days,
      estimated_premium, cover_level,
      first_name, last_name, dob, phone,
      occupation, licence_number,
      address, postcode,
      card_ending,
      status, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.run(
    sql,
    [
      req.user.id, policy_number,
      vehicle_make, vehicle_model, vehicle_engine, vehicle_year,
      vehicle_full, registration,
      start_date, end_date, duration_days,
      estimated_premium, cover_level,
      first_name, last_name, dob, phone,
      occupation, licence_number,
      address, postcode,
      card_ending,
      "pending", created_at
    ],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });

      res.json({
        success: true,
        policy_number,
        status: "pending"
      });
    }
  );
});

// ADMIN: pending list
router.get("/admin/pending", auth, admin, (req, res) => {
  db.all(
    "SELECT * FROM policies WHERE status='pending' ORDER BY id DESC",
    [],
    (err, rows) => res.json(rows || [])
  );
});

// ADMIN: approve
router.post("/admin/approve/:policy_number", auth, admin, (req, res) => {
  db.run(
    "UPDATE policies SET status='approved', approved_at=? WHERE policy_number=?",
    [new Date().toISOString(), req.params.policy_number],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ success: true });
    }
  );
});

// ADMIN: delete
router.delete("/admin/delete/:policy_number", auth, admin, (req, res) => {
  db.run(
    "DELETE FROM policies WHERE policy_number=?",
    [req.params.policy_number],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ success: true });
    }
  );
});

module.exports = router;
