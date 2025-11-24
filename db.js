const sqlite3 = require('sqlite3').verbose();

// ----------------------------------------------------
// USE LOCAL DATABASE FILE FOR RENDER FREE TIER
// (Disk-enabled instances are not available on free tier)
// ----------------------------------------------------
const db = new sqlite3.Database('./portal.db');

// ----------------------------------------------------
// INITIAL TABLE CREATION
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
      cardLast4 TEXT,

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
// AUTO-MIGRATION: ADD MISSING COLUMNS SAFELY
// ----------------------------------------------------
function addColumnIfMissing(table, column, type) {
  db.all(`PRAGMA table_info(${table})`, (err, cols) => {
    if (err) return;

    const exists = cols.some(c => c.name === column);
    if (!exists) {
      db.run(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`,
        (err2) => {
          if (!err2) console.log(`Added missing column: ${column}`);
        }
      );
    }
  });
}

// NEW REQUIRED FIELDS (matching latest frontend & backend)
addColumnIfMissing("policies", "start_time", "TEXT");
addColumnIfMissing("policies", "end_time", "TEXT");
addColumnIfMissing("policies", "excess", "INTEGER DEFAULT 750");
addColumnIfMissing("policies", "registeredKeeper", "TEXT");
addColumnIfMissing("policies", "title", "TEXT");
addColumnIfMissing("policies", "cardLast4", "TEXT");   // ensure always exists

module.exports = db;
