// routes/admin.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const ADMIN_EMAIL = "hardeepaks2000@gmail.com";
const ADMIN_PASS = "1Pe90pKda7@";

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
    return res.status(400).json({ error: 'Invalid admin' });
  }
  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
  res.json({ email, token });
});

// Get policies by status (pending / approved / etc.)
router.get('/policies', auth, adminOnly, (req, res) => {
  const status = req.query.status || 'pending';
  db.all(
    "SELECT * FROM policies WHERE status=? ORDER BY id DESC",
    [status],
    (err, rows) => res.json(rows || [])
  );
});

// Approve a policy
router.post('/policies/:id/approve', auth, adminOnly, (req, res) => {
  const id = req.params.id;
  const approved_at = new Date().toISOString();
  db.run(
    "UPDATE policies SET status='approved', approved_at=? WHERE policy_number=?",
    [approved_at, id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB' });
      res.json({ success: true });
    }
  );
});

// 🔥 NEW: Delete a policy completely
router.post('/policies/:id/delete', auth, adminOnly, (req, res) => {
  const id = req.params.id;
  db.run(
    "DELETE FROM policies WHERE policy_number=?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB' });
      res.json({ success: true });
    }
  );
});

module.exports = router;
