const sqlite3 = require('sqlite3').verbose();

// ----------------------------------------------------
// IMPORTANT: Use persistent storage on Render
// ----------------------------------------------------
const db = new sqlite3.Database('/var/data/portal.db');

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
// AUTO-MIGRATION FOR MISSING COLUMNS
// ----------------------------------------------------
function addColumnIfMissing(table, column, type) {
  db.get(
    `PRAGMA table_info(${table})`,
    (err, row) => {
      db.all(`PRAGMA table_info(${table})`, (err, cols) => {
        const exists = cols.some(c => c.name === column);
        if (!exists) {
          db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err2) => {
            if (!err2) {
              console.log(`Added missing column "${column}" to table "${table}"`);
            }
          });
        }
      });
    }
  );
}

// Add missing fields if needed
addColumnIfMissing("policies", "cardLast4", "TEXT");
addColumnIfMissing("policies", "holder_name", "TEXT");
addColumnIfMissing("policies", "licence_number", "TEXT");
addColumnIfMissing("policies", "occupation", "TEXT");

module.exports = db;
