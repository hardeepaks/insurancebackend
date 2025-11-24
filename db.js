const sqlite3 = require('sqlite3').verbose();

// Use local DB file (Render Free Tier)
const db = new sqlite3.Database('./portal.db');

// ----------------------------------------------------
// CREATE BASE TABLE
// ----------------------------------------------------
db.serialize(() => {
db.run(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
email TEXT UNIQUE,
password TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS policies (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
policy_number TEXT,

vehicle TEXT,
registration TEXT,

start_date TEXT,
end_date TEXT,

premium REAL,

holder_name TEXT,
dob TEXT,
phone TEXT,
email TEXT,
address TEXT,
postcode TEXT,
licence_number TEXT,
occupation TEXT,

status TEXT DEFAULT 'pending',
created_at TEXT,
approved_at TEXT
)
`);
});

// ----------------------------------------------------
// AUTO-MIGRATIONS (RUN EVERY BOOT)
// ----------------------------------------------------
function addColumnIfMissing(table, column, type) {
db.all(`PRAGMA table_info(${table})`, (err, cols) => {
if (err) return console.error(err);

const exists = cols.some(c => c.name === column);
if (!exists) {
console.log(`⚠ Adding missing column: ${column}`);
db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}
});
}

// New required columns
addColumnIfMissing("policies", "start_time", "TEXT");
addColumnIfMissing("policies", "end_time", "TEXT");
addColumnIfMissing("policies", "excess", "INTEGER DEFAULT 750");

// 🔥 **THIS IS THE FIX**
// Your system uses `registered_keeper` (underscore), not camelCase.
addColumnIfMissing("policies", "registered_keeper", "TEXT");

// Keep camelCase too (harmless)
addColumnIfMissing("policies", "registeredKeeper", "TEXT");

addColumnIfMissing("policies", "title", "TEXT");
addColumnIfMissing("policies", "cardLast4", "TEXT");

module.exports = db;