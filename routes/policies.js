const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/mine', auth, (req, res) => {
  db.all('SELECT * FROM policies WHERE user_id=? ORDER BY id DESC', [req.user.id], (err, rows) => {
    res.json(rows || []);
  });
});

router.get('/:id', auth, (req, res) => {
  db.get('SELECT * FROM policies WHERE policy_number=? AND user_id=?',
    [req.params.id, req.user.id],
    (err, row) => {
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    });
});

router.post('/submit', auth, (req, res) => {
  const { registration, vehicle, start_date, end_date, cover_level, premium } = req.body;
  const policy_number = 'PI-' + Date.now();
  const created_at = new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO policies
    (user_id,policy_number,vehicle,registration,start_date,end_date,premium,cover_level,status,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(
    req.user.id,
    policy_number,
    vehicle,
    registration,
    start_date,
    end_date,
    premium,
    cover_level,
    'pending',
    created_at,
    function (err) {
      if (err) return res.status(500).json({ error: 'DB' });
      res.json({ policy_number, status: 'pending' });
    }
  );
});

module.exports = router;
