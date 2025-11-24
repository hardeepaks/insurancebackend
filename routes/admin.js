const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const ADMIN_EMAIL = "hardeepaks2000@gmail.com";
const ADMIN_PASS = "1Pe90pKda7@";

/* -----------------------------------------------------
   ADMIN LOGIN
-------------------------------------------------------*/
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
    return res.status(400).json({ error: 'Invalid admin' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({ email, token });
});

/* -----------------------------------------------------
   GET POLICIES BY STATUS OR ALL POLICIES
-------------------------------------------------------*/
router.get('/policies', auth, adminOnly, (req, res) => {
  const status = req.query.status;

  let sql = "SELECT * FROM policies";
  let params = [];

  if (status) {
    sql += " WHERE status=?";
    params.push(status);
  }

  sql += " ORDER BY id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.json([]);
    res.json(rows || []);
  });
});

/* -----------------------------------------------------
   APPROVE POLICY
-------------------------------------------------------*/
router.post('/policies/:id/approve', auth, adminOnly, (req, res) => {
  const id = req.params.id;
  const approved_at = new Date().toISOString();

  db.run(
    "UPDATE policies SET status='approved', approved_at=? WHERE id=?",
    [approved_at, id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    }
  );
});

/* -----------------------------------------------------
   DELETE POLICY
-------------------------------------------------------*/
router.post('/policies/:id/delete', auth, adminOnly, (req, res) => {
  const id = req.params.id;

  db.run(
    "DELETE FROM policies WHERE id=?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    }
  );
});

/* -----------------------------------------------------
   UPDATE POLICY (EDIT SUPPORT)
   Admin can update ANY field safely
-------------------------------------------------------*/
router.post('/policies/:id/update', auth, adminOnly, (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  // Allowed editable columns
  const allowedFields = [
    "holder_name",
    "title",
    "registeredKeeper",
    "dob",
    "phone",
    "address",
    "postcode",
    "occupation",
    "start_date",
    "start_time",
    "end_date",
    "end_time",
    "premium",
    "excess",
    "cardLast4",
    "registration",
    "vehicle"
  ];

  let fields = [];
  let values = [];

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      fields.push(`${key}=?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const sql = `
    UPDATE policies 
    SET ${fields.join(", ")}
    WHERE id=?
  `;

  values.push(id);

  db.run(sql, values, function (err) {
    if (err) {
      console.error("UPDATE ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

module.exports = router;
