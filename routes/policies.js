const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

/* -----------------------------------------------------
GET ALL POLICIES FOR LOGGED-IN USER
-----------------------------------------------------*/
router.get('/mine', auth, (req, res) => {
db.all(
"SELECT * FROM policies WHERE user_id=? ORDER BY id DESC",
[req.user.id],
(err, rows) => res.json(rows || [])
);
});

/* -----------------------------------------------------
GET A SINGLE POLICY (USER ONLY)
-----------------------------------------------------*/
router.get('/:id', auth, (req, res) => {
db.get(
"SELECT * FROM policies WHERE policy_number=? AND user_id=?",
[req.params.id, req.user.id],
(err, row) => {
if (!row) return res.status(404).json({ error: 'Not found' });
res.json(row);
}
);
});

/* -----------------------------------------------------
SUBMIT POLICY (USER CREATES POLICY)
-----------------------------------------------------*/
router.post('/submit', auth, (req, res) => {
const {
// VEHICLE
registration,
vehicle,

// DATES
start_date,
end_date,
start_time,
end_time,

// FINANCIAL
premium,
excess,
cardLast4,

// DRIVER DETAILS
title,
holder_name,
registeredKeeper,
dob,
phone,
address,
postcode,
licence_number,
occupation
} = req.body;

const policy_number = 'PI-' + Date.now();
const created_at = new Date().toISOString();

// IMPORTANT: 23 columns → 23 placeholders
const stmt = db.prepare(`
INSERT INTO policies (
user_id,
policy_number,
vehicle,
registration,
start_date,
end_date,
start_time,
end_time,
premium,
excess,
cardLast4,
title,
holder_name,
registeredKeeper,
dob,
phone,
email,
address,
postcode,
licence_number,
occupation,
status,
created_at
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

stmt.run(
req.user.id,
policy_number,
vehicle,
registration,
start_date,
end_date,
start_time,
end_time,
premium,
excess || 750,
cardLast4 || null,
title || null,
holder_name || "",
registeredKeeper || "",
dob,
phone,
req.user.email,
address,
postcode,
licence_number || "",
occupation || "",
"pending",
created_at,
function (err) {
if (err) {
console.error("DB ERROR:", err);
return res.status(500).json({ error: "Database error" });
}

res.json({
success: true,
policy_number,
status: "pending"
});
}
);
});

module.exports = router;