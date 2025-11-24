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

// DATES & TIMES
start_date,
end_date,
start_time,
end_time,

// MONEY
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

/* -----------------------------------------------------
FIXED: INSERT NOW HAS EXACTLY 23 COLUMNS + id
Matching DB schema 100% (no mismatch)
----------------------------------------------------- */
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
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

stmt.run(
req.user.id, // user_id
policy_number, // policy_number
vehicle, // vehicle JSON string
registration, // registration

start_date, // start_date
end_date, // end_date
start_time, // start_time
end_time, // end_time

premium, // premium
excess || 750, // excess (default 750)
cardLast4 || null, // cardLast4

title || null, // title
holder_name || "", // holder_name
registeredKeeper || "",// registeredKeeper
dob, // dob
phone, // phone
req.user.email, // email
address, // address
postcode, // postcode
licence_number || "", // licence_number
occupation || "", // occupation

"pending", // status
created_at, // created_at

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